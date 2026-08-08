import dynamic from "next/dynamic";
import { invitation } from "@/data/invitation";
import MotionProvider from "@/components/motion/MotionProvider";
import EnvelopeGate from "@/components/EnvelopeGate";
import InvitationHero from "@/components/InvitationHero";
import ScriptureSection from "@/components/ScriptureSection";
import HeroPortrait from "@/components/HeroPortrait";
import EventDetails from "@/components/EventDetails";
import LocationSection from "@/components/LocationSection";
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
      <EnvelopeGate enabled={invitation.options.envelope} />
      <SceneIndicator />

      <main>
        <InvitationHero />
        <ScriptureSection />
        <HeroPortrait />
        <PhotoGallery />
        <EventDetails />
        <LocationSection />
        <ClosingSection />
      </main>
    </MotionProvider>
  );
}
