export const SITE = {
  name: "Zee99 Developers",
  tagline: "Built in Bahria Town. For fifteen years, nowhere else.",
  domain: "https://zee99developers.com",
  phoneDisplay: "0312 0000321",
  phoneIntl: "+92 312 0000321",
  waNumber: "923120000321",
  email: "info@zee99developers.com",
  address: "22 Nishter, Main Boulevard, Bahria Town, Lahore",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Zee99+Developers+22+Nishter+Main+Boulevard+Bahria+Town+Lahore",
};

export const waLink = (message?: string) =>
  `https://wa.me/${SITE.waNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const WA = {
  default: waLink("Hi, I'm interested in Zee99 Lifestyle."),
  siteVisit: waLink("Hi, I'd like to book a site visit to Zee99 Lifestyle."),
  overseas: waLink("Hi, I'm overseas and interested in Zee99 Lifestyle. My city and budget: "),
  channel: waLink("Hi, please add me to the Zee99 monthly market notes."),
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
] as const;

/** PLACEHOLDER counts — confirm with client before launch (spec: open item 1). */
export const STATS = [
  { value: 15, suffix: "+", label: "Years in Bahria Town" },
  { value: 24, suffix: "", label: "Projects delivered" },
  { value: 180, suffix: "+", label: "Homes handed over" },
  { value: 6, suffix: "", label: "Plazas & high-rises" },
] as const;
