import { areSameCoordinates, Coordinates, Inventaire } from "@ou-ca/ouca-model";
import { buildInventaireDbFromInventaire, buildInventaireFromInventaireDb } from "../mapping/inventaire-mapping";
import { InventaireDb } from "../objects/db/inventaire-db.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindCoordinatesByInventaireId, queryToFindInventaireIdByAllAttributes, queryToFindInventaireIdById } from "../sql/sql-queries-inventaire";
import { queryToFindMetosByInventaireId } from "../sql/sql-queries-meteo";
import { queryToFindAssociesByInventaireId } from "../sql/sql-queries-observateur";
import { queriesToSaveListOfEntities, queryToDeleteAnEntityByAttribute, queryToFindOneById } from "../sql/sql-queries-utils";
import { INVENTAIRE_ID, TABLE_INVENTAIRE, TABLE_INVENTAIRE_ASSOCIE, TABLE_INVENTAIRE_METEO } from "../utils/constants";
import { mapAssociesIds, mapMeteosIds } from "../utils/mapping-utils";
import { areArraysContainingSameValues } from "../utils/utils";
import { deleteEntityById, persistEntity } from "./sql-api-common";

const deleteAssociesAndMeteosByInventaireId = async (
  inventaireId: number
): Promise<void> => {
  if (inventaireId) {
    await Promise.all([
      queryToDeleteAnEntityByAttribute(
        TABLE_INVENTAIRE_ASSOCIE,
        INVENTAIRE_ID,
        inventaireId
      ),
      queryToDeleteAnEntityByAttribute(
        TABLE_INVENTAIRE_METEO,
        INVENTAIRE_ID,
        inventaireId
      )
    ]);
  }
};

const saveInventaireMeteos = async (
  inventaireId: number,
  meteosIds: number[]
): Promise<void> => {
  if (meteosIds.length > 0 && inventaireId) {
    await queriesToSaveListOfEntities(
      TABLE_INVENTAIRE_METEO,
      inventaireId,
      meteosIds
    );
  }
};

const saveInventaireAssocies = async (
  inventaireId: number,
  associesIds: number[]
): Promise<void> => {
  if (associesIds.length > 0 && inventaireId) {
    await queriesToSaveListOfEntities(
      TABLE_INVENTAIRE_ASSOCIE,
      inventaireId,
      associesIds
    );
  }
};

const findCoordinatesByInventaireId = async (
  id: number
): Promise<Coordinates> => {
  const coordinatesDb = await queryToFindCoordinatesByInventaireId(id);
  return coordinatesDb &&
    coordinatesDb[0] &&
    (coordinatesDb[0].longitude != null)
    ? {
      ...coordinatesDb[0]
    }
    : null;
};

export const findAssociesIdsByInventaireId = async (
  inventaireId: number
): Promise<number[]> => {
  const associesDb = await queryToFindAssociesByInventaireId(inventaireId);
  return mapAssociesIds(associesDb);
};

export const findMeteosIdsByInventaireId = async (
  inventaireId: number
): Promise<number[]> => {
  const meteosDb = await queryToFindMetosByInventaireId(inventaireId);
  return mapMeteosIds(meteosDb);
};

export const findExistingInventaireId = async (
  inventaire: Inventaire
): Promise<number> => {
  const inventaireIds = await queryToFindInventaireIdByAllAttributes(
    inventaire
  );

  for (const inventaireId of inventaireIds) {
    const id = inventaireId.id;
    // Compare the observateurs associes, the meteos and the coordinates
    const [associesIds, meteosIds, coordinates] = await Promise.all([
      findAssociesIdsByInventaireId(id),
      findMeteosIdsByInventaireId(id),
      findCoordinatesByInventaireId(id)
    ]);

    if (
      id !== inventaire.id &&
      areSameCoordinates(coordinates, inventaire.coordinates) &&
      areArraysContainingSameValues(associesIds, inventaire.associesIds) &&
      areArraysContainingSameValues(meteosIds, inventaire.meteosIds)
    ) {
      return id;
    }
  }

  return null;
};

export const deleteInventaireById = async (
  id: number
): Promise<SqlSaveResponse> => {
  return await deleteEntityById(TABLE_INVENTAIRE, id);
};

export const findInventaireIdById = async (id: number): Promise<number> => {
  const ids = await queryToFindInventaireIdById(id);
  return ids && ids[0]?.id ? ids[0].id : null;
};

export const findInventaireById = async (
  inventaireId: number
): Promise<Inventaire> => {
  const [inventairesDb, associesIds, meteosIds] = await Promise.all([
    queryToFindOneById<InventaireDb>(TABLE_INVENTAIRE, inventaireId),
    findAssociesIdsByInventaireId(inventaireId),
    findMeteosIdsByInventaireId(inventaireId)
  ]);

  if (!inventairesDb && !inventairesDb[0]?.id) {
    return null;
  }

  return buildInventaireFromInventaireDb(
    inventairesDb[0],
    associesIds,
    meteosIds
  );
};

const getCoordinatesToPersist = async (
  inventaire: Inventaire
): Promise<Coordinates> => {
  const newCoordinates = inventaire.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (inventaire.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldInventaire = await findInventaireById(inventaire.id);

    if (areSameCoordinates(oldInventaire?.coordinates, newCoordinates)) {
      coordinatesToPersist = oldInventaire.coordinates;
    }
  }

  return coordinatesToPersist;
};

export const persistInventaire = async (
  inventaire: Inventaire
): Promise<SqlSaveResponse> => {
  const coordinates = inventaire.coordinates
    ? await getCoordinatesToPersist(inventaire)
    : null;
  const inventaireDb = buildInventaireDbFromInventaire(inventaire, coordinates);

  // Delete the current associes and meteos to insert later the updated ones
  await deleteAssociesAndMeteosByInventaireId(inventaire.id);

  // Save the inventaire
  const inventaireResult = await persistEntity(TABLE_INVENTAIRE, inventaireDb);

  // Get the inventaire ID
  // If it is an update we take the existing ID else we take the inserted ID
  const inventaireId: number = inventaire.id
    ? inventaire.id
    : inventaireResult.insertId;

  // Save the observateurs associes and the meteos
  await saveInventaireAssocies(inventaireId, inventaire.associesIds);
  await saveInventaireMeteos(inventaireId, inventaire.meteosIds);

  return inventaireResult;
};
