"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_TYPES,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
  MAX_FILES_PER_BATCH,
  MAX_FILE_BYTES,
  UPLOAD_CONCURRENCY,
  thumbnailFrom,
  type UploadedAsset,
} from "./cloudinary";

/** One file's journey, as the guest sees it. */
export type UploadItem = {
  /** Stable per-item key. Filenames collide — phones love IMG_0001.jpg. */
  id: string;
  /** What the guest called it, for naming a file in an error message. */
  name: string;
  status: "waiting" | "uploading" | "done" | "failed";
  /** 0–100. Only meaningful while `status` is "uploading". */
  progress: number;
  /** Present once done. */
  asset?: UploadedAsset;
  /** Present once failed — a sentence, already written for a guest to read. */
  error?: string;
};

/**
 * Monotonic counter for item IDs.
 *
 * Not `Math.random()` or `Date.now()`: two files added in the same millisecond
 * would collide, and a duplicate React key means the wrong tile shows the wrong
 * progress. A counter cannot collide.
 */
let nextId = 0;

/**
 * Turn a browser/network failure into a sentence a guest can act on.
 *
 * Cloudinary returns a JSON body with its own message for a rejected upload,
 * but those are written for developers ("Upload preset must be whitelisted for
 * unsigned uploads"). A guest at a christening needs to know whether to try
 * again or give up, and nothing else.
 */
function guestFacingError(status: number): string {
  if (status === 0) return "The connection dropped. Please try again.";
  if (status === 413) return "That file is too large to send.";
  if (status === 420 || status === 429)
    return "Too many photographs at once — please try again in a moment.";
  if (status >= 500) return "Cloudinary is not responding. Please try again.";
  return "That file could not be sent. Please try again.";
}

/**
 * Upload one file, reporting progress as it goes.
 *
 * XMLHttpRequest rather than `fetch`, deliberately. `fetch` cannot report
 * upload progress — the streaming request body needed for it is unsupported on
 * Safari, which is most of the guests here. A progress bar that only ever reads
 * 0% and then 100% would be worse than none on a slow venue connection, where
 * the whole question in a guest's mind is "is this actually doing anything?"
 */
function uploadOne(
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal
): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_UPLOAD_URL);

    xhr.upload.addEventListener("progress", (event) => {
      // `lengthComputable` is false for a chunked body; leaving progress where
      // it was is honest, where a fabricated number would not be.
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(guestFacingError(xhr.status)));
        return;
      }

      try {
        const body = JSON.parse(xhr.responseText);
        const resourceType: string = body.resource_type ?? "image";
        const url: string = body.secure_url;

        resolve({
          publicId: body.public_id,
          url,
          thumbnailUrl: thumbnailFrom(url, resourceType),
          resourceType,
        });
      } catch {
        // A 2xx whose body is not the JSON we expect means the upload very
        // likely landed but we cannot prove it. Reported as a failure, because
        // telling a guest their photo arrived when we do not know that is the
        // one outcome worth avoiding.
        reject(new Error("That file could not be sent. Please try again."));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error(guestFacingError(0)))
    );
    xhr.addEventListener("abort", () =>
      reject(new DOMException("Aborted", "AbortError"))
    );

    signal.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.send(form);
  });
}

/**
 * All the upload machinery for the guest photo section.
 *
 * Kept out of the component so the component is only markup and handlers —
 * the queue, the concurrency limit and the progress bookkeeping are the parts
 * worth reading on their own.
 */
export function useGuestUploads() {
  const [items, setItems] = useState<UploadItem[]>([]);
  /** True while any file is in flight — drives the button's busy state. */
  const [busy, setBusy] = useState(false);

  /*
   * One abort controller for the whole session, so unmounting cancels every
   * in-flight request. Without this, a guest who navigates away mid-upload
   * leaves XHRs running that resolve into a setState on a dead component.
   */
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
  }, []);

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...next } : item))
    );
  }, []);

  /**
   * Accept a batch of files from the picker and send them.
   *
   * Validation happens before anything is queued, so a guest sees "that one is
   * too large" immediately rather than after watching it upload.
   */
  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const signal = abortRef.current?.signal;
      if (!signal || signal.aborted) return;

      const batch = Array.from(fileList).slice(0, MAX_FILES_PER_BATCH);

      /*
       * Two lists: what will be sent, and what was rejected out of hand.
       * Rejected files still get a tile, in "failed" state with a reason —
       * silently dropping a file a guest chose would leave them believing it
       * had been sent.
       */
      const queued: { item: UploadItem; file: File }[] = [];
      const rejected: UploadItem[] = [];

      for (const file of batch) {
        const id = `u${nextId++}`;

        if (file.size > MAX_FILE_BYTES) {
          rejected.push({
            id,
            name: file.name,
            status: "failed",
            progress: 0,
            error: "Too large to send — the limit is 10MB.",
          });
          continue;
        }

        queued.push({
          item: { id, name: file.name, status: "waiting", progress: 0 },
          file,
        });
      }

      setItems((current) => [
        ...current,
        ...rejected,
        ...queued.map((entry) => entry.item),
      ]);

      if (queued.length === 0) return;

      setBusy(true);

      /*
       * A fixed pool of workers pulling from a shared cursor, rather than
       * `Promise.all` over everything at once. This is what holds concurrency
       * at UPLOAD_CONCURRENCY: each worker takes the next index and only asks
       * for another when its current file finishes, so exactly three requests
       * are ever in flight regardless of batch size.
       */
      let cursor = 0;

      const worker = async () => {
        for (;;) {
          const index = cursor++;
          if (index >= queued.length) return;
          if (signal.aborted) return;

          const { item, file } = queued[index];
          patch(item.id, { status: "uploading", progress: 0 });

          try {
            const asset = await uploadOne(
              file,
              (percent) => patch(item.id, { progress: percent }),
              signal
            );
            patch(item.id, { status: "done", progress: 100, asset });
          } catch (error) {
            // An abort is the component unmounting, not a failure the guest
            // caused — leaving that tile untouched avoids flashing an error
            // during teardown.
            if (error instanceof DOMException && error.name === "AbortError") {
              return;
            }
            patch(item.id, {
              status: "failed",
              error:
                error instanceof Error
                  ? error.message
                  : "That file could not be sent.",
            });
          }
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_CONCURRENCY, queued.length) },
          worker
        )
      );

      if (!signal.aborted) setBusy(false);
    },
    [patch]
  );

  const succeeded = items.filter((item) => item.status === "done");
  const failed = items.filter((item) => item.status === "failed");

  return {
    items,
    succeeded,
    failed,
    busy,
    addFiles,
    accept: ACCEPTED_TYPES,
  };
}
