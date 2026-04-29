/** Shared types for the AI Policy Card. */

export interface CardRow {
  domain: string;
  score: number;
  qualifier: string;
}

export interface CardData {
  name: string;
  type: "band" | "listener";
  tagline: string;
  rows: CardRow[];
}
