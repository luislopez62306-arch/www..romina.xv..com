export interface EventDetails {
  name: string;
  time: string;
  address: string;
  mapUrl: string;
}

export interface ParentsConfig {
  father: string;
  mother: string;
}

export interface PadrinosConfig {
  godfather: string;
  godmother: string;
}

export interface GiftConfig {
  title: string;
  description: string;
  hasSobreros: boolean;
}

export interface InvitationConfig {
  name: string;
  date: string; // "2026-10-24"
  timePrefix: string; // "Sábado"
  year: string; // "2026"
  parents: ParentsConfig;
  padrinos: PadrinosConfig;
  chambelan?: string;
  ceremony: EventDetails;
  reception: EventDetails;
  dressCode: {
    type: string;
    description: string;
  };
  gifts: GiftConfig;
  musicUrl: string;
  coverImageUrl: string;
  coverImages?: string[];
  galleryImages?: string[];
  adminPassword?: string;
}

export interface RsvpEntry {
  id: string;
  name: string;
  attending: boolean;
  companions: number;
  message?: string;
  timestamp: string;
}

export interface PassEntry {
  id: string;
  guestName: string;
  totalPasses: number;
  confirmed?: "yes" | "no";
  confirmedName?: string;
  confirmedCompanions?: number;
}

export interface GuestBookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  designIndex: number; // For styling the sticky notes/cards uniquely
}

export function getCleanUrl(url: string, fallback: string): string {
  if (!url || url.includes("PEGAR_AQUI_") || url.trim() === "") {
    return fallback;
  }
  
  let clean = url.trim();

  // ImgBB Optimizer: Remove `.md.` (medium) and `.th.` (thumbnail) format suffixes
  // e.g., https://i.ibb.co/ks2SFFMB/IMG-4052.md.jpg -> https://i.ibb.co/ks2SFFMB/IMG-4052.jpg
  clean = clean.replace(/\.md\.(jpe?g|png|webp|gif|bmp)$/i, '.$1');
  clean = clean.replace(/\.th\.(jpe?g|png|webp|gif|bmp)$/i, '.$1');

  // Google Content / Photos Optimizer: convert sizing scale to max (e.g., =s2048) or remove size constraints
  if (clean.includes("googleusercontent.com")) {
    if (clean.includes("=")) {
      clean = clean.replace(/=s\d+.*$/, "=s2048");
      clean = clean.replace(/=w\d+-h\d+.*$/, "=s2048");
    } else {
      clean = clean + "=s2048";
    }
  }

  // Generic query-string dimensions (Unsplash, Shopify, and others)
  // Clean up width/height/size parameters or set to high resolution
  try {
    if (clean.includes("?") && (clean.includes("width=") || clean.includes("w=") || clean.includes("height=") || clean.includes("h="))) {
      const urlObj = new URL(clean);
      if (urlObj.searchParams.has("w")) urlObj.searchParams.set("w", "2048");
      if (urlObj.searchParams.has("width")) urlObj.searchParams.set("width", "2048");
      if (urlObj.searchParams.has("h")) urlObj.searchParams.delete("h");
      if (urlObj.searchParams.has("height")) urlObj.searchParams.delete("height");
      clean = urlObj.toString();
    }
  } catch (e) {
    // Fail-safe, keep URL as is
  }

  return clean;
}

export const INITIAL_CONFIG: InvitationConfig = {
  name: "Romina",
  date: "2026-08-15",
  timePrefix: "Sábado 15 de Agosto",
  year: "2026",
  parents: {
    father: "Jose Antonio",
    mother: "Martha iliana",
  },
  padrinos: {
    godfather: "Edy",
    godmother: "Cristina",
  },
  chambelan: "Luis Ernesto Armenta Carrillo",
  ceremony: {
    name: "Parroquia San José",
    time: "08:00 P.M.",
    address: "Los Mochis, Sinaloa.",
    mapUrl: "https://maps.google.com/?q=Parroquia+San+Jose+Los+Mochis",
  },
  reception: {
    name: "Salón Liarah",
    time: "09:00 P.M.",
    address: "Blvd. Los Mochis - Topo",
    mapUrl: "https://maps.google.com/?q=Salon+Liarah+Los+Mochis",
  },
  dressCode: {
    type: "Formal",
    description: "Me reservo amablemente el color rosa para mi vestido.",
  },
  gifts: {
    title: "Mesa de Regalos & Lluvia de Sobres",
    description: "Tu presencia es mi mayor regalo, pero si deseas tener un detalle conmigo, contaremos con lluvia de sobres (o cofre de regalos) el día del evento.",
    hasSobreros: true,
  },
  musicUrl: "https://www.dropbox.com/scl/fi/rtu43j0s084gboiwewzsr/Taylor-Swift-Daylight-Official-Audio.mp3?rlkey=afz3iwf1hxeg3r4tcddz4ywx4&st=kwc0uj1h&raw=1",
  coverImageUrl: "https://i.ibb.co/ks2SFFMB/IMG-4052.jpg",
  coverImages: [
    "https://i.ibb.co/ks2SFFMB/IMG-4052.jpg",
    "https://i.ibb.co/fdwFSF2f/IMG-4051.jpg",
    "https://i.ibb.co/5fpRb1q/IMG-4050.jpg"
  ],
  galleryImages: [
    "https://i.ibb.co/ksYhJ0vf/IMG-4049.jpg",
    "https://i.ibb.co/MxvFRXNt/IMG-4048.jpg",
    "https://i.ibb.co/zTq4LxFW/IMG-4046.jpg",
    "https://i.ibb.co/fdwFSF2f/IMG-4051.jpg",
    "https://i.ibb.co/5fpRb1q/IMG-4050.jpg"
  ],
  adminPassword: "romi",
};
  
 
