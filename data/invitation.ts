/**
 * ─────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT
 * ─────────────────────────────────────────────────────────────
 *  All personalised content for the invitation lives here.
 *  Change these values and the entire site updates.
 *
 *  Placeholders are wrapped in [BRACKETS] — replace every one
 *  before sharing the link with family.
 * ─────────────────────────────────────────────────────────────
 */

export type GalleryPhoto = {
  /** Path relative to /public — e.g. "/photos/01.jpg" */
  src: string;
  /** Meaningful description for screen readers. Required. */
  alt: string;
  /** CSS object-position. Tune per photo so her face stays visible on mobile. */
  position?: string;
  /** Optional short caption. Leave undefined for most photos. */
  caption?: string;
};

export type Invitation = {
  child: {
    name: string;
    baptismName?: string;
    /** Shown in the browser tab / OG title */
    shortName: string;
  };
  parents: { names: string; signature: string };
  event: {
    /** ISO 8601 with timezone offset. Drives the countdown. */
    isoDate: string;
    dayOfWeek: string;
    dateLabel: string;
    timeLabel: string;
    year: string;
  };
  church: {
    name: string;
    addressLines: string[];
    /** Short label used under the invitation heading */
    locality: string;
  };
  reception?: {
    name: string;
    addressLines: string[];
    timeLabel: string;
  };
  maps: {
    /** Exact Google Maps place URL */
    google: string;
    /** Apple Maps URL. Optional — falls back to a query built from the address. */
    apple?: string;
  };
  scripture: { lines: string[]; source: string };
  /** Ge'ez / Amharic line. Set to null until the family confirms wording. */
  geez: string | null;
  heroPhoto: GalleryPhoto;
  gallery: GalleryPhoto[];
  closingPhoto: GalleryPhoto;
  /** Extra photos for the optional "little moments" grid. Empty = section hidden. */
  moments: GalleryPhoto[];
  options: {
    /**
     * Show the wax-sealed envelope cover on first visit. Tapping it opens the
     * invitation; returning visitors in the same session skip it. Append
     * `?skipEnvelope` to any link to bypass it.
     */
    envelope: boolean;
    /**
     * Path to a wax-seal image, e.g. "/seal.png". Needs a transparent
     * background — anything opaque will show as a rectangle on the envelope.
     * Leave undefined to use the built-in drawn seal instead.
     */
    sealImage?: string;
    /** Show the countdown in the details section */
    countdown: boolean;
    /** Show the "Sacred music" toggle. Requires audioSrc. */
    music: boolean;
    audioSrc?: string;
  };
};

export const invitation: Invitation = {
  child: {
    name: "Amaldan",
    baptismName: undefined, // Christian name given at baptism — optional
    shortName: "Amaldan",
  },

  parents: {
    names: "Nardos Mesfin & Filimon Haylemariyam",
    signature: "Mommy & Daddy",
  },

  event: {
    // Sunday 23 August 2026, midday. Ethiopia is UTC+3 year-round.
    isoDate: "2026-08-23T12:30:00+03:00",
    dayOfWeek: "Sunday",
    dateLabel: "23 August 2026",
    timeLabel: "Lunch Time",
    year: "2026",
  },

  /*
   * The celebration is at the family home rather than a church hall, so this
   * block carries the house location. `name` is what guests read first.
   */
  church: {
    name: "At Our Home",
    addressLines: [
      "Near Assela Menahriya",
      "Next to Highleahue School",
    ],
    locality: "Near Assela Menahriya",
  },

  // No separate reception — the baptism celebration is the gathering at home.
  reception: undefined,

  maps: {
    // ⚠️ Replace with a dropped pin on the house so relatives navigate exactly.
    // In Google Maps: long-press the spot → Share → Copy link.
    google:
      "https://www.google.com/maps/search/?api=1&query=Highleahue+School+Assela",
    apple: undefined, // auto-generated from the address if left undefined
  },

  scripture: {
    lines: [
      "Unless one is born of water and the Spirit,",
      "he cannot enter the kingdom of God.",
    ],
    source: "John 3:5",
  },

  /**
   * Ge'ez blessing — "In the name of the Father, the Son, and the Holy Spirit."
   * Left as null deliberately: do not publish liturgical Ge'ez until the
   * family or church has confirmed the exact wording.
   * To enable, set to: "በአብ ወበወልድ ወበመንፈስ ቅዱስ"
   */
  geez: null,

  /*
   * `position` is CSS object-position. These photographs are square, so on a
   * tall phone screen a good deal is cropped from top and bottom — each value
   * is set to keep Amaldan's face in frame.
   */
  heroPhoto: {
    src: "/photos/hero.jpg",
    alt: "Amaldan smiling wide, wrapped in a soft pink blanket with her hands tucked under her chin",
    position: "50% 30%",
    caption: "Our little blessing.",
  },

  gallery: [
    {
      src: "/photos/01.jpg",
      alt: "Amaldan lying beside a small teddy bear, looking directly at the camera",
      position: "68% 42%",
    },
    {
      src: "/photos/02.jpg",
      alt: "A close portrait of Amaldan resting on a blanket, wide awake",
      position: "40% 60%",
      caption: "Wonderfully made.",
    },
    {
      src: "/photos/03.jpg",
      alt: "Amaldan in a pink dress and flower headband, holding a red balloon at two months old",
      position: "50% 32%",
    },
    {
      src: "/photos/04.jpg",
      alt: "Amaldan looking upward with a gentle smile, red balloons beside her",
      position: "50% 42%",
      caption: "Growing in grace.",
    },
    {
      src: "/photos/05.jpg",
      alt: "Amaldan laughing in a yellow and black striped outfit, surrounded by flowers",
      position: "50% 26%",
    },
  ],

  closingPhoto: {
    src: "/photos/closing.jpg",
    alt: "Amaldan asleep in a white hooded outfit on a soft pink blanket",
    position: "50% 45%",
  },

  // Optional second gallery. Leave as [] to hide the section entirely.
  moments: [],

  options: {
    envelope: true,
    // The supplied seal artwork, with its grey backdrop keyed out by
    // scripts/cutout-seal.mjs. Set to undefined to fall back to the drawn seal.
    sealImage: "/seal.png",
    countdown: false, // off by default — keeps the tone intimate rather than event-like
    music: false,
    audioSrc: undefined,
  },
};

/** Derived: an Apple Maps URL, built from the address if none was supplied. */
export function appleMapsUrl(inv: Invitation): string {
  if (inv.maps.apple) return inv.maps.apple;
  const q = encodeURIComponent(
    [inv.church.name, ...inv.church.addressLines].join(", ")
  );
  return `https://maps.apple.com/?q=${q}`;
}

/** Derived: total number of scenes, for the section indicator. */
export const SCENES = [
  { id: "invitation", label: "Invitation" },
  { id: "blessing", label: "Blessing" },
  { id: "gallery", label: "Gallery" },
  { id: "details", label: "Details" },
] as const;
