/**
 * Every factual statement shown on the site carries its verification status, so the
 * mockup can never present an unverified detail as confirmed by the establishment.
 */
export type FactStatus =
  /** Fictional placeholder written for the demo. */
  | "demo"
  /** Found in a public source (directory, social page) but not confirmed by the owner. */
  | "public"
  /** Confirmed in writing by the establishment. */
  | "confirme";

export type Fact = {
  value: string;
  status: FactStatus;
  /** Where a "public" fact was seen, with the date it was checked. */
  source?: string;
};

export type NavLink = { href: string; label: string };

export type SocialLink = { network: string; url: string; status: FactStatus; source?: string };

export type Hours = { days: string; hours: string };

export type SiteConfig = {
  name: string;
  shortName: string;
  /** schema.org type used in the JSON-LD block (Restaurant, School, RealEstateAgent…). */
  schemaType: string;
  tagline: string;
  description: string;
  locality: string;
  district: string;
  keywords: string[];
  nav: NavLink[];
  primaryCta: NavLink;
  contact: {
    address: Fact;
    phone: Fact | null;
    email: Fact | null;
    /** Digits only, international format. Overridden by NEXT_PUBLIC_WHATSAPP_NUMBER. */
    whatsapp: Fact | null;
    whatsappMessage: string;
    mapsQuery: string;
    hours: { status: FactStatus; source?: string; rows: Hours[] };
  };
  social: SocialLink[];
};

export type MenuItem = {
  name: string;
  description: string;
  /** Price in FCFA. Left null until the establishment supplies its price list. */
  price: number | null;
  tags?: string[];
  status: FactStatus;
};

export type MenuCategory = { id: string; name: string; intro: string; items: MenuItem[] };

export type GalleryCategory = "plats" | "ambiance" | "evenements";

export type GalleryImage = {
  file: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
};

export type EventFormat = { title: string; description: string; capacity: Fact; status: FactStatus };

export type Specialty = { title: string; description: string; image: string; status: FactStatus; source?: string };
