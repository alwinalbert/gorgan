export type ThreatLevel = "low" | "medium" | "high" | "critical";

export interface FavoriteSong {
  title: string;
  artist?: string;
  url?: string; // optional link to song file/stream
}

export interface CurrentThreat {
  level: ThreatLevel;
  probabilityPct: number; // 0..100
  updatedAt: number;
  source?: string; // "system"|"gemini"|"manual"
}

// src/types/user.ts
export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;

  friends?: string[];           // accepted friends
  friendRequests?: string[];    // incoming requests (uids)

  favoriteSong?: FavoriteSong;
  currentThreat?: CurrentThreat;

  lastLocation?: {
    lat: number;
    lon: number;
    updatedAt: number;
  };

  createdAt: number;
  updatedAt?: number;
}