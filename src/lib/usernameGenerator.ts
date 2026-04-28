/**
 * Reddit-style random alias generator.
 * Thematically aligned with the HZ aesthetic.
 */

const ADJECTIVES = [
  "Cryptic", "Spectral", "Eldritch", "Umbral", "Liminal",
  "Feral", "Arcane", "Profane", "Abyssal", "Nocturnal",
  "Hollow", "Runic", "Cursed", "Wretched", "Blasphemous",
  "Ashen", "Vile", "Hallowed", "Forsaken", "Dire",
  "Ghastly", "Molten", "Putrid", "Ravenous", "Twisted",
  "Silent", "Voracious", "Blighted", "Hexed", "Sanguine",
];

const NOUNS = [
  "Hydra", "Chimera", "Wraith", "Phantom", "Revenant",
  "Basilisk", "Lich", "Ghoul", "Specter", "Leviathan",
  "Gargoyle", "Manticore", "Banshee", "Behemoth", "Cerberus",
  "Wyvern", "Golem", "Wendigo", "Minotaur", "Kraken",
  "Harpy", "Djinn", "Imp", "Ogre", "Wyrm",
  "Shade", "Fiend", "Brute", "Stalker", "Harbinger",
];

export function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}
