import { SITE } from "./site";
import { PicName, asPic } from "./pics";

/* The five Ottawa centres. Shared because all four tracks sell the same
   buildings and a wrong address fixed in one place must be fixed everywhere.
   Per-track copy about each centre lives in that track's page file (DETAILS).

   Sources: each centre's OWN page on tcccanada.com ("Stop By" / "Come over").
   Two of these disagree with other TCC material - see CLAUDE.md, Open items:
     - Laurier is 135 Laurier Ave W (the old Unbounce page said 251).
     - Blair is K1J 1A3 on its page, K1J 1G7 in the site menu.
   Queensway is Bells Corners per its page, not Nepean or Pinecrest.

   Photo rule: every `photo` is from that centre's own gallery. Never swap in a
   frame from the shared homepage carousel - several are Vancouver interiors. */

export type Location = {
  id: "collaboration" | "laurier" | "innovation" | "queensway" | "blair";
  name: string;
  address: string;
  city: string;
  note: string;
  photo: PicName;
  alt: string;
  /** Google Maps query string. */
  query: string;
  /** Calendly `a1` prefill, exactly as the location pages send it. */
  calendly: string;
  /** Option label in every track's Location select. */
  formLabel: string;
};

export const LOCATIONS: Location[] = [
  {
    id: "collaboration",
    name: "The Collaboration Centre",
    address: "150 Elgin Street, 8th floor",
    city: "Ottawa ON K2P 1L4",
    note: "Downtown, the former Shopify HQ",
    photo: asPic("tcc-121"),
    alt: "Lounge with timber-clad walls at The Collaboration Centre, 150 Elgin Street, Ottawa",
    query: "150 Elgin Street Ottawa ON K2P 1L4",
    calendly: "Ottawa - The Collaboration Centre",
    formLabel: "The Collaboration Centre, 150 Elgin St",
  },
  {
    id: "laurier",
    name: "The Laurier Centre",
    address: "135 Laurier Avenue West",
    city: "Ottawa ON K1P 5J2",
    note: "Downtown, five floors near Parliament Hill",
    photo: asPic("laurier-centre"),
    alt: "The building housing The Laurier Centre in downtown Ottawa",
    query: "135 Laurier Ave W Ottawa ON K1P 5J2",
    calendly: "Ottawa - The Laurier Centre",
    formLabel: "The Laurier Centre, 135 Laurier Ave W",
  },
  {
    id: "innovation",
    name: "The Innovation Centre",
    address: "1000 Innovation Drive, Suite 500",
    city: "Kanata ON K2K 3E7",
    note: "Kanata North Business Park",
    photo: asPic("tcc-61"),
    alt: "Lounge seating at The Innovation Centre, 1000 Innovation Drive, Kanata",
    query: "1000 Innovation Drive Kanata ON K2K 3E7",
    calendly: "Ottawa - The Innovation Centre",
    formLabel: "The Innovation Centre, Kanata",
  },
  {
    id: "queensway",
    name: "The Queensway Centre",
    address: "15 Fitzgerald Road, Suite 200",
    city: "Ottawa ON K2H 9G1",
    note: "Bells Corners business park",
    photo: asPic("img-43a743e9"),
    alt: "Kitchen and dining area at The Queensway Centre, 15 Fitzgerald Road, Bells Corners",
    query: "15 Fitzgerald Road Ottawa ON K2H 9G1",
    calendly: "Ottawa - Queensway Centre",
    formLabel: "The Queensway Centre, Bells Corners",
  },
  {
    id: "blair",
    name: "The Blair Centre",
    address: "1900 City Park Drive, 3rd floor",
    city: "Ottawa ON K1J 1A3",
    note: "East end, at Blair Station",
    photo: asPic("city-park-1900"),
    alt: "1900 City Park Drive, the building housing The Blair Centre in Gloucester",
    query: "1900 City Park Drive Ottawa ON",
    calendly: "Ottawa - Blair Centre",
    formLabel: "The Blair Centre, City Park Dr",
  },
];

export const mapEmbed = (l: Location) =>
  `https://www.google.com/maps?q=${encodeURIComponent(l.query)}&output=embed`;

export const directions = (l: Location) =>
  `https://maps.google.com/?q=${encodeURIComponent(l.query)}`;

/** Calendly pre-filled with the centre, the same deep link the location pages use. */
export const tourUrl = (l: Location) =>
  `${SITE.tour}?a1=${encodeURIComponent(l.calendly)}&autofill=true`;

export type LocationDetails = Record<Location["id"], string>;
