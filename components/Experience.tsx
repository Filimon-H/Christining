"use client";

import { useCallback, useState } from "react";
import { invitation } from "@/data/invitation";
import EnvelopeGate from "./EnvelopeGate";
import SoundToggle from "./SoundToggle";

/**
 * Holds the one piece of state two sibling scenes both need: whether the
 * envelope has been opened.
 *
 * The sound has to begin on the tap that opens the envelope — that gesture is
 * what browsers accept as permission to play audio, and starting it any later
 * would either be blocked or arrive unannounced. `page.tsx` stays a server
 * component; only this wrapper is client-side.
 */
export default function Experience() {
  /** True once the guest's tap has opened the envelope — permits autoplay. */
  const [openedByTap, setOpenedByTap] = useState(false);
  /** True whenever the cover is out of the way, however that happened. */
  const [coverGone, setCoverGone] = useState(false);

  const handleOpen = useCallback(() => setOpenedByTap(true), []);
  const handleRevealed = useCallback(() => setCoverGone(true), []);

  const { music, audioSrc, audioVolume, audioLoop } = invitation.options;

  return (
    <>
      <EnvelopeGate
        enabled={invitation.options.envelope}
        onOpen={handleOpen}
        onRevealed={handleRevealed}
      />

      {music && audioSrc && (
        <SoundToggle
          src={audioSrc}
          volume={audioVolume}
          loop={audioLoop}
          /*
           * Two separate ideas, previously conflated into one flag:
           *
           * `visible` — show the control. True whenever the invitation is on
           *   screen, including a return visit where the envelope is skipped.
           *   Tying this to the tap meant returning guests never saw a button.
           *
           * `autoplay` — start playing unprompted. Only ever true for the tap
           *   itself, which is the gesture a browser accepts.
           */
          visible={coverGone}
          autoplay={openedByTap}
        />
      )}
    </>
  );
}
