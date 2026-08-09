import dynamic from "next/dynamic";
import MotionProvider from "@/components/motion/MotionProvider";
import Ambience from "@/components/Ambience";
import Experience from "@/components/Experience";
import InvitationHero from "@/components/InvitationHero";
import ScriptureSection from "@/components/ScriptureSection";
import HeroPortrait from "@/components/HeroPortrait";
import EventDetails from "@/components/EventDetails";
import ClosingSection from "@/components/ClosingSection";
import SceneIndicator from "@/components/SceneIndicator";

/**
 * Swiper is the heaviest dependency on the page and none of it is needed for
 * the invitation itself, so the gallery is split into its own chunk that
 * downloads while the guest is still reading Scene 1.
 */
const PhotoGallery = dynamic(() => import("@/components/PhotoGallery"));

export default function Page() {
  return (
    <MotionProvider>
      {/* Ambient layer sits behind every scene. */}
      <Ambience />
      {/* The envelope and the sound control share one piece of state: whether
          the envelope has been opened. */}
      <Experience />
      <SceneIndicator />

      <main>
        <InvitationHero />
        <ScriptureSection />
        <HeroPortrait />
        <PhotoGallery />
        {/* Venue and map links are part of EventDetails — they used to sit in
            a separate scene that repeated the same name and address. */}
        <EventDetails />
        <ClosingSection />
      </main>
    </MotionProvider>
  );
}
