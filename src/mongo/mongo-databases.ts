export const DONNEES_COLLECTION = "donnees";

export const INVENTAIRES_COLLECTION = "inventaires";

export const COMMUNES_COLLECTION = "communes";

export const LIEUX_DITS_COLLECTION = "lieudits";

export const ESPECES_COLLECTION = "especes";

export const COMPORTEMENTS_COLLECTION = "comportements";

export const AGES_COLLECTIONS = "ages";

/**
 * The list of collections present in the base naturaliste database
 */
export const BASE_NATURALISTE_COLLECTION_NAMES = [
  INVENTAIRES_COLLECTION,
  DONNEES_COLLECTION,
  "settings",
  "observateurs",
  "departements",
  COMMUNES_COLLECTION,
  LIEUX_DITS_COLLECTION,
  "meteos",
  "classes",
  ESPECES_COLLECTION,
  AGES_COLLECTIONS,
  "sexes",
  "estimationsNombre",
  "estimationsDistance",
  COMPORTEMENTS_COLLECTION,
  "milieux"
] as const;

/**
 * The possible "types" of collections for the base naturaliste
 */
export type BaseNaturalisteCollectionName = typeof BASE_NATURALISTE_COLLECTION_NAMES[number];
