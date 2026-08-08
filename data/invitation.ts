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
    /** Show the countdown in the details section */
    countdown: boolean;
    /** Show the "Sacred music" toggle. Requires audioSrc. */
    music: boolean;
    audioSrc?: string;
  };
};

export const invitation: Invitation = {
  child: {
    name: "[DAUGHTER'S NAME]",
    baptismName: undefined, // e.g. "Walatta Maryam" — optional
    shortName: "[NAME]",
  },

  parents: {
    names: "[MOTHER'S NAME] & [FATHER'S NAME]",
    signature: "Mommy & Daddy",
  },

  event: {
    // ⚠️ Replace with the real date/time. Drives the countdown.
    isoDate: "2026-09-12T10:00:00+03:00",
    dayOfWeek: "[DAY OF WEEK]",
    dateLabel: "[DATE]",
    timeLabel: "[TIME]",
    year: "2026",
  },

  church: {
    name: "[CHURCH NAME]",
    addressLines: ["[STREET ADDRESS]", "[CITY, COUNTRY]"],
    locality: "[CITY]",
  },

  // Delete this whole block if there is no reception.
  reception: {
    name: "[RECEPTION VENUE]",
    addressLines: ["[RECEPTION ADDRESS]"],
    timeLabel: "[RECEPTION TIME]",
  },

  maps: {
    google: "https://www.google.com/maps/search/?api=1&query=[CHURCH+NAME]",
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

  heroPhoto: {
    src: "/photos/hero.jpg",
    alt: "[DAUGHTER'S NAME] resting peacefully, wrapped in a white shawl",
    position: "50% 40%",
    caption: "Our little blessing.",
  },

  gallery: [
    {
      src: "/photos/01.jpg",
      alt: "[DAUGHTER'S NAME] asleep with one hand curled beneath her cheek",
      position: "50% 35%",
    },
    {
      src: "/photos/02.jpg",
      alt: "[DAUGHTER'S NAME] lying on a cream blanket in soft morning light",
      position: "50% 50%",
      caption: "Wonderfully made.",
    },
    {
      src: "/photos/03.jpg",
      alt: "Close portrait of [DAUGHTER'S NAME] with her eyes open",
      position: "50% 30%",
    },
    {
      src: "/photos/04.jpg",
      alt: "[DAUGHTER'S NAME] held in her mother's arms",
      position: "50% 40%",
      caption: "Surrounded by love.",
    },
    {
      src: "/photos/05.jpg",
      alt: "[DAUGHTER'S NAME]'s hand resting in her father's palm",
      position: "50% 50%",
    },
    {
      src: "/photos/06.jpg",
      alt: "[DAUGHTER'S NAME] dressed in white, looking toward the window",
      position: "50% 35%",
    },
    {
      src: "/photos/07.jpg",
      alt: "[DAUGHTER'S NAME] smiling while being held upright",
      position: "50% 30%",
      caption: "Growing in grace.",
    },
    {
      src: "/photos/08.jpg",
      alt: "[DAUGHTER'S NAME] with her family gathered around her",
      position: "50% 45%",
    },
  ],

  closingPhoto: {
    src: "/photos/closing.jpg",
    alt: "[DAUGHTER'S NAME] sleeping peacefully in soft light",
    position: "50% 40%",
  },

  // Optional second gallery. Leave as [] to hide the section entirely.
  moments: [],

  options: {
    envelope: true,
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
