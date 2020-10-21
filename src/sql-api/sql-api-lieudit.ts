import { areSameCoordinates } from "@ou-ca/ouca-model/coordinates-system/coordinates-helper";
import { Coordinates } from "@ou-ca/ouca-model/coordinates.object";
import { Lieudit } from "@ou-ca/ouca-model/lieudit.model";
import * as _ from "lodash";
import { buildLieuditDbFromLieudit, buildLieuditFromLieuditDb, buildLieuxditsFromLieuxditsDb } from "../mapping/lieudit-mapping";
import { LieuditDb } from "../objects/db/lieudit-db.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllLieuxDits, queryToFindLieuDitByCommuneIdAndNom, queryToFindNumberOfDonneesByLieuDitId } from "../sql/sql-queries-lieudit";
import { queryToFindOneById } from "../sql/sql-queries-utils";
import { TABLE_LIEUDIT } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

const getFirstLieuDit = (lieuxDitsDb: LieuditDb[]): Lieudit => {
  let lieuDit: Lieudit = null;
  if (lieuxDitsDb && lieuxDitsDb[0]?.id) {
    lieuDit = buildLieuditFromLieuditDb(lieuxDitsDb[0]);
  }
  return lieuDit;
};

export const findAllLieuxDits = async (): Promise<Lieudit[]> => {
  const [lieuxDitsDb, nbDonneesByLieuDit] = await Promise.all([
    queryToFindAllLieuxDits(),
    queryToFindNumberOfDonneesByLieuDitId()
  ]);

  const lieuxDits: Lieudit[] = buildLieuxditsFromLieuxditsDb(lieuxDitsDb);

  _.forEach(lieuxDits, (lieuDit: Lieudit) => {
    lieuDit.nbDonnees = getNbByEntityId(lieuDit, nbDonneesByLieuDit);
  });

  return lieuxDits;
};

export const findLieuDitById = async (lieuditId: number): Promise<Lieudit> => {
  const lieuxDitsDb = await queryToFindOneById<LieuditDb>(
    TABLE_LIEUDIT,
    lieuditId
  );
  return getFirstLieuDit(lieuxDitsDb);
};

export const findLieuDitByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<Lieudit> => {
  const lieuxDitsDb = await queryToFindLieuDitByCommuneIdAndNom(communeId, nom);
  return getFirstLieuDit(lieuxDitsDb);
};

const getCoordinatesToPersist = async (
  lieuDit: Lieudit
): Promise<Coordinates> => {
  const newCoordinates = lieuDit.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (lieuDit.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldLieuDit = await findLieuDitById(lieuDit.id);

    if (areSameCoordinates(oldLieuDit?.coordinates, newCoordinates)) {
      coordinatesToPersist = oldLieuDit.coordinates;
    }
  }

  return coordinatesToPersist;
};

export const persistLieuDit = async (
  lieuDit: Lieudit
): Promise<SqlSaveResponse> => {
  if (_.has(lieuDit, "coordinates")) {
    lieuDit.coordinates = await getCoordinatesToPersist(lieuDit);
  }

  const lieuditDb = buildLieuditDbFromLieudit(lieuDit);

  return persistEntity(TABLE_LIEUDIT, lieuditDb);
};
