/**
 * ─────────────────────────────────────────────────────────────
 *  CLOUDINARY — guest photo uploads
 * ─────────────────────────────────────────────────────────────
 *  Guests upload straight from their phone to Cloudinary. There is
 *  no server in the path, which is the point: the site stays a
 *  static export with no secret to leak and nothing to keep running
 *  on the day.
 *
 *  That is possible because Cloudinary supports *unsigned* upload
 *  presets — a named, server-side configuration that says "anyone
 *  holding this preset name may upload, under exactly these rules."
 *  The preset name is public by design. It is not a credential: it
 *  grants only the narrow permission the preset itself describes,
 *  and never read, list, delete or transform access.
 *
 *  See README-PHOTOS.md for the five-minute account setup.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Cloud name and preset are read at build time from the environment.
 *
 * `NEXT_PUBLIC_` is required — these are inlined into the browser bundle,
 * which is where the upload happens. Both values are safe to publish, per
 * the note above.
 */
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

/**
 * Whether uploads are configured at all.
 *
 * Checked before the section renders. An unconfigured build hides the whole
 * scene rather than showing a button that fails on tap — a guest who taps
 * "Share a photograph" and gets an error has been let down more than one who
 * never saw the invitation to try.
 */
export const uploadsEnabled = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET
);

/**
 * Cloudinary's unsigned upload endpoint.
 *
 * `/auto/upload` rather than `/image/upload`: guests will send the odd short
 * video from a phone camera roll, and `auto` accepts both by sniffing the file
 * rather than rejecting anything that is not a still.
 */
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

/**
 * Ceiling on a single file, in bytes.
 *
 * Cloudinary's own free-tier limit is 10MB for unsigned uploads. Checking here
 * as well means an oversized file is refused instantly with a sentence the
 * guest can act on, rather than after a slow upload over event wifi that ends
 * in a raw 400 from the API.
 *
 * Modern phones shoot 3–5MB stills, so this rejects essentially nothing —
 * it catches 4K video and the occasional RAW export.
 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * How many files one guest may send in a single batch.
 *
 * Not a technical limit — a courtesy one. It keeps a guest from selecting
 * their entire camera roll on a shared venue connection and blocking everyone
 * else's uploads behind theirs. They can simply tap again for another batch.
 */
export const MAX_FILES_PER_BATCH = 20;

/**
 * How many uploads run at once.
 *
 * Venue wifi is the constraint, not the browser. Firing twenty parallel
 * requests over a congested connection makes every one of them slow and
 * timeout-prone; three keeps the pipe busy without saturating it, and means
 * progress advances visibly file by file rather than all at once at the end.
 */
export const UPLOAD_CONCURRENCY = 3;

/** File types the picker offers and the client accepts. */
export const ACCEPTED_TYPES = "image/*,video/*";

/**
 * Result of one file's upload, as far as the UI is concerned.
 *
 * Deliberately not Cloudinary's full response — the component needs a preview
 * URL and an identity, and coupling the view to the API's payload shape would
 * mean a Cloudinary response change breaking the render.
 */
export type UploadedAsset = {
  /** Cloudinary's public ID — the asset's identity in your media library. */
  publicId: string;
  /** Delivered URL of the stored asset. */
  url: string;
  /** A small, cropped thumbnail for the confirmation grid. */
  thumbnailUrl: string;
  /** "image" or "video", from Cloudinary's own classification. */
  resourceType: string;
};

/**
 * Build a thumbnail URL by inserting a transformation into a delivery URL.
 *
 * Cloudinary transforms on delivery: the segment after `/upload/` describes
 * what to do, and the result is generated once then cached at their CDN. So
 * the confirmation grid costs a 200px square per photo rather than the full
 * 4MB original — which matters when a guest has just sent twenty of them over
 * the same connection they are now viewing them on.
 *
 * `c_fill,g_auto` crops to fill the square with Cloudinary choosing the crop
 * centre by content, so faces survive the crop. `q_auto,f_auto` picks quality
 * and format per browser.
 */
export function thumbnailFrom(url: string, resourceType: string): string {
  /*
   * Videos are handed back as a still frame rather than a playable clip: the
   * grid is a receipt confirming what arrived, and twenty autoplaying videos
   * would be neither calm nor kind to a phone battery. `.jpg` asks Cloudinary
   * for a poster frame.
   */
  const transform =
    resourceType === "video"
      ? "c_fill,g_auto,h_200,w_200,q_auto,f_jpg/"
      : "c_fill,g_auto,h_200,w_200,q_auto,f_auto/";

  const marker = "/upload/";
  const at = url.indexOf(marker);
  // A URL that does not look like a Cloudinary delivery URL is returned as-is
  // rather than mangled — the grid showing a full-size image is a far better
  // failure than it showing a broken one.
  if (at === -1) return url;

  const head = url.slice(0, at + marker.length);
  const tail = url.slice(at + marker.length);

  const withTransform = `${head}${transform}${tail}`;

  // A video's stored URL ends in its own container extension (.mov, .mp4);
  // `f_jpg` changes the format but not that suffix, so it is swapped here or
  // Cloudinary is asked for a JPEG at a .mov address and returns the video.
  return resourceType === "video"
    ? withTransform.replace(/\.[^./]+$/, ".jpg")
    : withTransform;
}
