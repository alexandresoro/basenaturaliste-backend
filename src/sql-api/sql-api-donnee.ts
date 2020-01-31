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
import { IEspeceDocument } from "basenaturaliste-model/mongo/IEspeceDocument";
import { IInventaireDocument } from "basenaturaliste-model/mongo/IInventaireDocument";
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
import MongoConnection from "../mongo/mongo-connection";
import {
  DONNEES_COLLECTION,
  ESPECES_COLLECTION,
  INVENTAIRES_COLLECTION
} from "../mongo/mongo-databases";
import { ObjectId } from "mongodb";
import {
  findLieuxDitsByCommunesIds,
  findCommunesByDepartementIds
} from "../mongo/mongo-queries";
import { IDonneeDocument } from "basenaturaliste-model/mongo/IDonneeDocument";

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

  const donneesIds: number[] = _.map(donnees, donnee => {
    return donnee.id;
  });

  const [
    associes,
    meteos,
    comportements,
    milieux
  ]: any[][] = await Promise.all([
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
  ]);

  const [
    associesByDonnee,
    meteosByDonnee,
    comportementsByDonnee,
    milieuxByDonnee
  ]: { [key: number]: any }[] = _.map(
    [associes, meteos, comportements, milieux],
    table => {
      return _.groupBy(table, tableElement => {
        return tableElement.donneeId;
      });
    }
  );

  _.forEach(donnees, (donnee: FlatDonnee) => {
    donnee.associes = _.map(
      associesByDonnee[donnee.id],
      associe => associe.libelle
    ).join(", ");
    donnee.meteos = _.map(
      meteosByDonnee[donnee.id],
      meteo => meteo.libelle
    ).join(", ");
    donnee.comportements = _.map(
      comportementsByDonnee[donnee.id],
      comportement => {
        return {
          code: comportement.code,
          libelle: comportement.libelle
        };
      }
    );
    donnee.milieux = _.map(milieuxByDonnee[donnee.id], milieu => {
      return {
        code: milieu.code,
        libelle: milieu.libelle
      };
    });
  });

  return donnees;
};

export const findDonneesByCustomizedFiltersMongo = async (
  filter: DonneesFilter
): Promise<IDonneeDocument[]> => {
  // 1. First part of the aggregation pipeline is to match direct elements of a donnee
  const directFieldsDonnees = [
    "id",
    "nombre",
    "distance",
    "regroupement",
    "commentaire"
  ];
  const directFieldsDonneesAsArray = ["comportements", "milieux"];
  const directFieldsDonneesAsArrayMapping = {
    ages: "ageId",
    sexes: "sexeId",
    estimationsNombre: "estimationNombreId",
    estimationsDistance: "estimationDistanceId",
    especes: "especeId"
  };
  const matchDirect = {};

  _.assignIn(
    matchDirect,
    _.pickBy(filter, (filterValue, filterKey) => {
      return directFieldsDonnees.includes(filterKey) && !_.isNil(filterValue);
    })
  );

  _.forEach(directFieldsDonneesAsArray, directFieldsDonneesAsArrayId => {
    if (
      !_.isNil(filter[directFieldsDonneesAsArrayId]) &&
      _.isArray(filter[directFieldsDonneesAsArrayId]) &&
      filter[directFieldsDonneesAsArrayId]
    ) {
      matchDirect[directFieldsDonneesAsArrayId] = {
        $in: _.map(filter[directFieldsDonneesAsArrayId], id => new ObjectId(id))
      };
    }
  });

  _.forEach(
    directFieldsDonneesAsArrayMapping,
    (directFieldDonneeAsArrayMongoId, directFieldDonneeAsArrayRequestName) => {
      if (
        !_.isNil(filter[directFieldDonneeAsArrayRequestName]) &&
        _.isArray(filter[directFieldDonneeAsArrayRequestName]) &&
        filter[directFieldDonneeAsArrayRequestName].length
      ) {
        matchDirect[directFieldDonneeAsArrayMongoId] = {
          $in: _.map(
            filter[directFieldDonneeAsArrayRequestName],
            id => new ObjectId(id)
          )
        };
      }
    }
  );

  // 2. If a class request was provided, without any espece, filter by classe
  if (
    !(filter as any).especes &&
    (filter as any).classes &&
    _.isArray((filter as any).classes) &&
    (filter as any).classes.length
  ) {
    // Find all especes of the given classes
    const matchingEspeces = await MongoConnection.getCollection<
      IEspeceDocument
    >(ESPECES_COLLECTION)
      .find({
        classeId: {
          $in: _.map((filter as any).classes, id => new ObjectId(id))
        }
      })
      .toArray();

    if (matchingEspeces && matchingEspeces.length) {
      matchDirect["especeId"] = {
        $in: _.map(matchingEspeces, matchingEspece => matchingEspece._id)
      };
    }
  }

  // 3. Some fields e.g. departement are linked to a list of matching inventaires ids
  const directFieldsInventaires = ["temperature", "heure", "duree"];
  const directFieldsInventairesAsArray = ["associes", "meteos"];
  const directFieldsInventairesAsArrayMapping = {
    observateurs: "observateurId",
    lieuxdits: "lieuditId"
  };

  let matchingInventaireIds: ObjectId[] = [];
  const inventaireFilter = {};

  _.assignIn(
    inventaireFilter,
    _.pickBy(filter, (filterValue, filterKey) => {
      return (
        directFieldsInventaires.includes(filterKey) && !_.isNil(filterValue)
      );
    })
  );

  _.forEach(
    directFieldsInventairesAsArray,
    directFieldsInventairesAsArrayId => {
      if (
        !_.isNil(filter[directFieldsInventairesAsArrayId]) &&
        _.isArray(filter[directFieldsInventairesAsArrayId]) &&
        filter[directFieldsInventairesAsArrayId]
      ) {
        inventaireFilter[directFieldsInventairesAsArrayId] = {
          $in: _.map(
            filter[directFieldsInventairesAsArrayId],
            id => new ObjectId(id)
          )
        };
      }
    }
  );

  _.forEach(
    directFieldsInventairesAsArrayMapping,
    (
      directFieldsInventairesAsArrayMongoId,
      directFieldsInventairesAsArrayRequestName
    ) => {
      if (
        !_.isNil(filter[directFieldsInventairesAsArrayRequestName]) &&
        _.isArray(filter[directFieldsInventairesAsArrayRequestName]) &&
        filter[directFieldsInventairesAsArrayRequestName].length
      ) {
        inventaireFilter[directFieldsInventairesAsArrayMongoId] = {
          $in: _.map(
            filter[directFieldsInventairesAsArrayRequestName],
            id => new ObjectId(id)
          )
        };
      }
    }
  );

  // If no lieux dits are provided, try to find if communes or departements are provided
  if (!(filter as any).lieuxdits) {
    if ((filter as any).communes) {
      if (
        _.isArray((filter as any).communes) &&
        (filter as any).communes.length
      ) {
        // Filter by communes
        const matchingLieuxDits = await findLieuxDitsByCommunesIds(
          (filter as any).communes
        );
        if (matchingLieuxDits && matchingLieuxDits.length) {
          inventaireFilter["lieuditId"] = {
            $in: _.map(
              matchingLieuxDits,
              matchingLieuDit => matchingLieuDit._id
            )
          };
        }
      }
    } else if (
      (filter as any).departements &&
      _.isArray((filter as any).departements) &&
      (filter as any).departements.length
    ) {
      // Filter by departements
      const matchingCommunes = await findCommunesByDepartementIds(
        (filter as any).departements
      );
      if (matchingCommunes && matchingCommunes.length) {
        const matchingLieuxDits = await findLieuxDitsByCommunesIds(
          _.map(matchingCommunes, matchingCommune => matchingCommune._id)
        );
        if (matchingLieuxDits && matchingLieuxDits.length) {
          inventaireFilter["lieuditId"] = {
            $in: _.map(
              matchingLieuxDits,
              matchingLieuDit => matchingLieuDit._id
            )
          };
        }
      }
    }
  }

  if (_.keys(inventaireFilter).length) {
    // We have a filter on the inventaires to apply
    const matchingInventaires = await MongoConnection.getCollection<
      IInventaireDocument
    >(INVENTAIRES_COLLECTION)
      .find(inventaireFilter)
      .toArray();
    matchingInventaireIds = _.map(
      matchingInventaires,
      matchingInventaire => matchingInventaire._id
    );
  }

  const aggregationPipeline = [];

  if (_.keys(matchDirect).length) {
    aggregationPipeline.push({ $match: matchDirect });
  }

  if (_.keys(inventaireFilter).length) {
    aggregationPipeline.push({
      $match: { inventaireId: { $in: matchingInventaireIds } }
    });
  }

  return MongoConnection.getCollection<IDonneeDocument>(DONNEES_COLLECTION)
    .aggregate(aggregationPipeline)
    .toArray();
};
