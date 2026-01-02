// app/lib/locations.ts

export type City = {
  slug: string;
  name: string;
  country: "NZ" | "AU";
};

export const LOCATIONS: City[] = [
  // 🇳🇿 NEW ZEALAND
  { slug: "auckland", name: "Auckland", country: "NZ" },
  { slug: "wellington", name: "Wellington", country: "NZ" },
  { slug: "christchurch", name: "Christchurch", country: "NZ" },
  { slug: "hamilton", name: "Hamilton", country: "NZ" },
  { slug: "tauranga", name: "Tauranga", country: "NZ" },

  // 🇦🇺 AUSTRALIA
  { slug: "sydney", name: "Sydney", country: "AU" },
  { slug: "melbourne", name: "Melbourne", country: "AU" },
  { slug: "brisbane", name: "Brisbane", country: "AU" },
  { slug: "perth", name: "Perth", country: "AU" },
  { slug: "adelaide", name: "Adelaide", country: "AU" },
];
