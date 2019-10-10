import * as _ from "lodash";
import moment from "moment";
import {
  getQueryToFindAllComportements,
  getQueryToFindComportementsIdsByDonneeId
} from "../sql/sql-queries-comportement";
import {
  getQueryToFindDonneesByCriterion,
  getQueryToFindDonneeIdsByAllAttributes,
  getQueryToUpdateDonneesInventaireId,
  getQueryToFindLastDonnee,
  getQueryToFindLastDonneeId
} from "../sql/sql-queries-donnee";
import { getQueryToFindAllMeteos } from "../sql/sql-queries-meteo";
import {
  getQueryToFindAllMilieux,
  getQueryToFindMilieuxIdsByDonneeId
} from "../sql/sql-queries-milieu";
import { getQueryToFindAllAssocies } from "../sql/sql-queries-observateur";
import { SqlConnection } from "./sql-connection";
import { FlatDonnee } from "basenaturaliste-model/flat-donnee.object";
import { AssocieByDonnee } from "../objects/associe-by-donnee.object";
import { MilieuByDonnee } from "../objects/milieu-by-donnee.object";
import { ComportementByDonnee } from "../objects/comportement-by-donnee.object";
import { MeteoByDonnee } from "../objects/meteo-by-donnee.object";
import { DonneesFilter } from "basenaturaliste-model/donnees-filter.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import {
  getDeleteEntityByAttributeQuery,
  getSaveEntityQuery,
  DB_SAVE_MAPPING,
  getSaveListOfEntitesQueries
} from "../sql/sql-queries-utils";
import {
  TABLE_DONNEE_COMPORTEMENT,
  TABLE_DONNEE_MILIEU,
  TABLE_DONNEE
} from "../utils/constants";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  areArraysContainingSameValues,
  getArrayFromObjects
} from "../utils/utils";

export const persistDonnee = async (
  donneeToSave: Donnee
): Promise<SqlSaveResponse> => {
  if (donneeToSave.id) {
    // It is an update: we delete the current comportements
    // and milieux to insert later the updated ones
    await SqlConnection.query(
      getDeleteEntityByAttributeQuery(
        TABLE_DONNEE_COMPORTEMENT,
        "donnee_id",
        donneeToSave.id
      ) +
        getDeleteEntityByAttributeQuery(
          TABLE_DONNEE_MILIEU,
          "donnee_id",
          donneeToSave.id
        )
    );
  }

  const saveDonneeResponse: SqlSaveResponse = await SqlConnection.query(
    getSaveEntityQuery(
      TABLE_DONNEE,
      {
        ...donneeToSave,
        dateCreation: moment().format("YYYY-MM-DD HH:mm:ss")
      },
      DB_SAVE_MAPPING.donnee
    )
  );

  // If it is an update we take the existing ID else we take the inserted ID
  const savedDonneeId: number = donneeToSave.id
    ? donneeToSave.id
    : saveDonneeResponse.insertId;

  // Save the comportements
  if (donneeToSave.comportementsIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_DONNEE_COMPORTEMENT,
        savedDonneeId,
        donneeToSave.comportementsIds
      )
    );
  }

  // Save the milieux
  if (donneeToSave.milieuxIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_DONNEE_MILIEU,
        savedDonneeId,
        donneeToSave.milieuxIds
      )
    );
  }

  return saveDonneeResponse;
};

export const getExistingDonneeId = async (
  donnee: Donnee
): Promise<number | null> => {
  const response = await SqlConnection.query(
    getQueryToFindDonneeIdsByAllAttributes(donnee)
  );

  const eligibleDonneeIds: number[] = getArrayFromObjects(response, "id");

  for (const id of eligibleDonneeIds) {
    // Compare the comportements and the milieux
    const response = await SqlConnection.query(
      getQueryToFindComportementsIdsByDonneeId(id) +
        getQueryToFindMilieuxIdsByDonneeId(id)
    );

    const comportementsIds: number[] = getArrayFromObjects(
      response[0],
      "comportementId"
    );
    const milieuxIds: number[] = getArrayFromObjects(response[1], "milieuId");

    if (
      id !== donnee.id &&
      areArraysContainingSameValues(
        comportementsIds,
        donnee.comportementsIds
      ) &&
      areArraysContainingSameValues(milieuxIds, donnee.milieuxIds)
    ) {
      return id;
    }
  }

  return null;
};

export const findLastDonneeId = async (): Promise<number> => {
  const result = await SqlConnection.query(getQueryToFindLastDonneeId());
  return result && result[0] ? result[0].id : null;
};

export const updateInventaireIdForDonnees = async (
  oldInventaireId: number,
  newInventaireId: number
): Promise<SqlSaveResponse> => {
  return await SqlConnection.query(
    getQueryToUpdateDonneesInventaireId(oldInventaireId, newInventaireId)
  );
};
export const findDonneesByCustomizedFilters = async (
  filter: DonneesFilter
): Promise<FlatDonnee[]> => {
  const donnees: any[] = await SqlConnection.query(
    getQueryToFindDonneesByCriterion(filter)
  );

  const donneesIds: number[] = _.map(donnees, (donnee) => {
    return donnee.id;
  });

  const [associes, meteos, comportements, milieux]: any[][] = await Promise.all(
    [
      donnees.length
        ? SqlConnection.query(getQueryToFindAllAssocies(donneesIds))
        : [],
      donnees.length
        ? SqlConnection.query(getQueryToFindAllMeteos(donneesIds))
        : [],
      donnees.length
        ? SqlConnection.query(getQueryToFindAllComportements(donneesIds))
        : [],
      donnees.length
        ? SqlConnection.query(getQueryToFindAllMilieux(donneesIds))
        : []
    ]
  );

  const [
    associesByDonnee,
    meteosByDonnee,
    comportementsByDonnee,
    milieuxByDonnee
  ]: { [key: number]: any }[] = _.map(
    [associes, meteos, comportements, milieux],
    (table) => {
      return _.groupBy(table, (tableElement) => {
        return tableElement.donneeId;
      });
    }
  );

  _.forEach(donnees, (donnee: FlatDonnee) => {
    donnee.associes = _.map(
      associesByDonnee[donnee.id],
      (associe) => associe.libelle
    ).join(", ");
    donnee.meteos = _.map(
      meteosByDonnee[donnee.id],
      (meteo) => meteo.libelle
    ).join(", ");
    donnee.comportements = _.map(
      comportementsByDonnee[donnee.id],
      (comportement) => {
        return {
          code: comportement.code,
          libelle: comportement.libelle
        };
      }
    );
    donnee.milieux = _.map(milieuxByDonnee[donnee.id], (milieu) => {
      return {
        code: milieu.code,
        libelle: milieu.libelle
      };
    });
  });

  return donnees;
};
