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
  const [opened, setOpened] = useState(false);

  const handleOpen = useCallback(() => setOpened(true), []);

  const { music, audioSrc, audioVolume, audioLoop, envelope } =
    invitation.options;

  return (
    <>
      <EnvelopeGate enabled={envelope} onOpen={handleOpen} />

      {music && audioSrc && (
        <SoundToggle
          src={audioSrc}
          volume={audioVolume}
          loop={audioLoop}
          // When the envelope is disabled there is no opening tap to hook, so
          // the control appears straight away and waits to be pressed.
          armed={opened || !envelope}
        />
      )}
    </>
  );
}
