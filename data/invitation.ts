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
    /**
     * The father's given name, following Ethiopian naming convention.
     *
     * Kept separate from `name` rather than concatenated so the given name can
     * stay the large centrepiece with this set beneath it in smaller type —
     * "Amaldan Filimon" as one string would force the whole line down a size
     * step to fit a phone screen.
     */
    familyName?: string;
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
    /** Amharic day + date, shown beneath the English. */
    dayOfWeekAm?: string;
    dateLabelAm?: string;
    timeLabelAm?: string;
  };
  church: {
    name: string;
    addressLines: string[];
    /** Short label used under the invitation heading */
    locality: string;
    /** Amharic venue name and address, shown beneath the English. */
    nameAm?: string;
    addressLinesAm?: string[];
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
    /**
     * Path to a photographic envelope image, e.g. "/photos/envelope.jpg".
     * Must be shot square-on and cropped to the paper edge — the cover
     * displays it flat, with no perspective correction of its own.
     *
     * When set, this replaces the drawn SVG envelope *and* the separate wax
     * seal: the artwork already carries its own seal, so `sealImage` is
     * ignored. Leave undefined to use the drawn envelope.
     */
    envelopeImage?: string;
    /** Aspect ratio (width / height) of `envelopeImage`. Required with it. */
    envelopeAspect?: number;
    /** Show the countdown in the details section */
    countdown: boolean;
    /**
     * Play `audioSrc` when the guest opens the envelope, with a mute control.
     *
     * Sound never starts on its own — the tap that opens the envelope is the
     * gesture that permits it, and the choice to mute is remembered.
     */
    music: boolean;
    audioSrc?: string;
    /** Peak volume, 0–1. Deliberately low: the invitation is the subject. */
    audioVolume?: number;
    /** Loop the audio. Leave false for a one-off recording. */
    audioLoop?: boolean;
  };
};

export const invitation: Invitation = {
  child: {
    name: "Amaldan",
    familyName: "Filimon",
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

    /*
     * Amharic date, in the Ethiopian calendar — the family's own wording.
     *
     * ነሃሴ 17 2018 E.C. is the same day as 23 August 2026 (verified by
     * conversion, not assumed). Ethiopian guests read and plan by this
     * calendar, so this is the date that will actually mean something to
     * them; the Gregorian line above sits directly beside it for anyone
     * reading in English.
     *
     * Spelling follows the family: ነሃሴ rather than the more common ነሐሴ.
     */
    dayOfWeekAm: "እሁድ",
    dateLabelAm: "ነሃሴ 17 2018",
    timeLabelAm: "የምሳ ሰዓት",
  },

  /*
   * The celebration is at the family home rather than a church hall, so this
   * block carries the house location. `name` is what guests read first.
   */
  church: {
    name: "At Our Home",
    /*
     * The town comes first. Relatives travelling in need to know it is Adama
     * before any of the local landmarks mean anything to them.
     */
    addressLines: [
      "Adama, just in from the Africa fuel station",
      "Near Assela Menahriya",
    ],
    locality: "Adama",

    /*
     * Amharic venue and directions.
     *
     * "ከ አፍሪካ ማደያ ገባ ብሎ" is the family's own wording, kept verbatim — it is
     * how a local would actually give these directions, and "ገባ ብሎ" (just in
     * from / set back from) carries a precision that no literal translation
     * of an English address would.
     */
    nameAm: "ቤታችን",
    addressLinesAm: ["አዳማ ፣ አሰላ መናኃሪያ አካባቢ ከ አፍሪካ ማደያ ገባ ብሎ"],
  },

  // No separate reception — the baptism celebration is the gathering at home.
  reception: undefined,

  /*
   * Dropped pin supplied by the family (maps.app.goo.gl/jZVLno5mCYb87RJp9),
   * resolved to its coordinates here so the link never depends on Google's
   * short-link service staying up.
   *
   * Both apps get the same lat/long, so both open the identical spot rather
   * than Apple guessing from a text address.
   */
  maps: {
    google: "https://www.google.com/maps/search/?api=1&query=8.525618,39.280536",
    apple: "https://maps.apple.com/?ll=8.525618,39.280536&q=Amaldan%27s%20Christening",
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
  /*
   * `position` is CSS object-position, tuned per photograph.
   *
   * Most of these are square and fill a tall phone screen, so a good deal is
   * cropped from the top and bottom. Each value keeps Amaldan's face in frame;
   * where she is off-centre the horizontal value shifts too.
   */
  heroPhoto: {
    src: "/photos/hero.jpg",
    alt: "Amaldan in a pink bow headband, lying beside a large teddy bear and reaching for it",
    /*
     * She lies at the far left of a square frame, so a tall crop has to hold
     * the left edge or her face is cut in half. 0% keeps her whole and lets the
     * teddy bear fall away to the right, which is the right trade — she is the
     * subject, the bear is context.
     */
    position: "0% 55%",
    caption: "Our little blessing.",
  },

  gallery: [
    {
      src: "/photos/01.jpg",
      alt: "Amaldan wrapped in a soft grey hooded blanket, glancing to one side",
      position: "50% 34%",
    },
    {
      src: "/photos/02.jpg",
      alt: "Amaldan smiling wide with both hands curled beneath her chin, on a cream sheepskin",
      position: "50% 38%",
      caption: "Wonderfully made.",
    },
    {
      src: "/photos/03.jpg",
      alt: "A close portrait of Amaldan resting on a cream blanket, wide awake",
      position: "42% 62%",
    },
    {
      src: "/photos/04.jpg",
      alt: "Amaldan in a cream flower headband, looking past the camera in profile",
      position: "44% 46%",
      caption: "Growing in grace.",
    },
    {
      src: "/photos/05.jpg",
      alt: "Amaldan laughing in a blush ruffled dress, looking upward",
      position: "52% 30%",
    },
    {
      src: "/photos/06.jpg",
      alt: "Amaldan wrapped in a soft patterned shawl, looking straight at the camera",
      position: "50% 40%",
      caption: "A gift from God.",
    },
  ],

  closingPhoto: {
    src: "/photos/closing.jpg",
    alt: "Amaldan asleep in a white hooded outfit, one hand curled beside her cheek, on a soft pink blanket",
    /*
     * She lies in the right two-thirds of the frame with her head just above
     * centre. Holding 62% horizontally keeps her face and hands in view once
     * the square is cropped to a tall screen.
     */
    position: "62% 45%",
  },

  // Optional second gallery. Leave as [] to hide the section entirely.
  moments: [],

  options: {
    envelope: true,
    // The supplied seal artwork, with its grey backdrop keyed out by
    // scripts/cutout-seal.mjs. Set to undefined to fall back to the drawn seal.
    sealImage: "/seal.png",
    // Photographic envelope, deskewed to a true rectangle from the supplied
    // artwork by scripts/deskew-envelope.mjs. Because it carries its own
    // printed seal, `sealImage` above is unused while this is set.
    envelopeImage: "/photos/envelope.jpg",
    envelopeAspect: 1800 / 1243,
    // Days, hours and minutes until the baptism. Minute resolution only — no
    // ticking seconds, which would read as a sales timer rather than an
    // invitation. Becomes a thank-you line once the date has passed.
    countdown: true,
    music: true,
    audioSrc: "/audio/blessing.m4a",
    audioVolume: 0.35,
    // A 50s recording rather than a music bed, so it plays once and stops.
    audioLoop: false,
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
  /*
   * Present whether or not Cloudinary is configured. The indicator drops
   * entries whose section is absent from the DOM, so an unconfigured build
   * simply shows four dots rather than a fifth that scrolls nowhere.
   */
  { id: "photos", label: "Photographs" },
] as const;
