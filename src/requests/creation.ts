import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import * as _ from "lodash";
import moment from "moment";
import { HttpParameters } from "../http/httpParameters.js";
import creationPageCreateDonneeMock from "../mocks/creation-page/creation-page-create-donnee.json";
import creationPageCreateInventaireMock from "../mocks/creation-page/creation-page-create-inventaire.json";
import creationPageInitMock from "../mocks/creation-page/creation-page-init.json";
import { SqlConnection } from "../sql/sql-connection.js";
import {
  DB_SAVE_MAPPING,
  getAllFromTablesQuery,
  getDeleteEntityByAttributeQuery,
  getDeleteEntityByIdQuery,
  getFindAssociesByInventaireIdQuery,
  getFindComportementsByDonneeIdQuery,
  getFindDonneeByIdQuery,
  getFindLastDonneeQuery,
  getFindLastRegroupementQuery,
  getFindMetosByInventaireIdQuery,
  getFindMilieuxByDonneeIdQuery,
  getFindNextDonneeByCurrentDonneeIdQuery,
  getFindNumberOfDonneesByDoneeeEntityIdQuery,
  getFindNumberOfDonneesQuery,
  getFindPreviousDonneeByCurrentDonneeIdQuery,
  getSaveEntityQuery,
  getSaveListOfEntitesQueries
} from "../sql/sql-queries-utils.js";
import {
  KEY_ARE_ASSOCIES_DISPLAYED,
  KEY_DEFAULT_AGE_ID,
  KEY_DEFAULT_DEPARTEMENT_ID,
  KEY_DEFAULT_ESTIMATION_NOMBRE_ID,
  KEY_DEFAULT_NOMBRE,
  KEY_DEFAULT_OBSERVATEUR_ID,
  KEY_DEFAULT_SEXE_ID,
  KEY_IS_DISTANCE_DISPLAYED,
  KEY_IS_METEO_DISPLAYED,
  KEY_IS_REGROUPEMENT_DISPLAYED,
  TABLE_DONNEE,
  TABLE_DONNEE_COMPORTEMENT,
  TABLE_DONNEE_MILIEU,
  TABLE_INVENTAIRE,
  TABLE_INVENTAIRE_ASSOCIE,
  TABLE_INVENTAIRE_METEO
} from "../utils/constants.js";
import {
  mapAssociesIds,
  mapCommunes,
  mapComportementsIds,
  mapEspeces,
  mapEstimationsNombre,
  mapLieuxdits,
  mapMeteosIds,
  mapMilieuxIds
} from "../utils/mapping-utils.js";

const getDefaultValueForConfigurationField = (
  configuration: any[],
  libelle: string,
  isBoolean?: boolean,
  isNumber?: boolean
): any | number | boolean => {
  const retrievedValue = _.find(
    configuration,
    (value) => value.libelle === libelle
  ).value;
  if (isBoolean) {
    return +retrievedValue === 1;
  } else if (isNumber) {
    return +retrievedValue;
  } else {
    return retrievedValue;
  }
};

export const creationInit = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<CreationPage> => {
  if (isMockDatabaseMode) {
    return creationPageInitMock as any;
  } else {
    const results = await SqlConnection.query(
      getFindLastDonneeQuery() +
        getFindNumberOfDonneesQuery() +
        getFindLastRegroupementQuery() +
        getAllFromTablesQuery([
          "configuration",
          "observateur",
          "departement",
          "commune",
          "lieudit",
          "meteo",
          "classe",
          "espece",
          "age",
          "sexe",
          "estimation_nombre",
          "estimation_distance",
          "comportement",
          "milieu"
        ])
    );

    const lastDonnee: any = await buildDonneeFromFlatDonnee(results[0][0]);

    const creationPage: CreationPage = {
      lastDonnee,
      numberOfDonnees: results[1][0].nbDonnees,
      nextRegroupement: results[2][0].regroupement,
      defaultObservateurId: getDefaultValueForConfigurationField(
        results[3],
        KEY_DEFAULT_OBSERVATEUR_ID,
        false,
        true
      ),
      defaultDepartementId: getDefaultValueForConfigurationField(
        results[3],
        KEY_DEFAULT_DEPARTEMENT_ID,
        false,
        true
      ),
      defaultEstimationNombreId: getDefaultValueForConfigurationField(
        results[3],
        KEY_DEFAULT_ESTIMATION_NOMBRE_ID,
        false,
        true
      ),
      defaultNombre: getDefaultValueForConfigurationField(
        results[3],
        KEY_DEFAULT_NOMBRE,
        false,
        true
      ),
      defaultSexeId: getDefaultValueForConfigurationField(
        results[3],
        KEY_DEFAULT_SEXE_ID,
        false,
        true
      ),
      defaultAgeId: getDefaultValueForConfigurationField(
        results[3],
        KEY_DEFAULT_AGE_ID,
        false,
        true
      ),
      areAssociesDisplayed: getDefaultValueForConfigurationField(
        results[3],
        KEY_ARE_ASSOCIES_DISPLAYED,
        true
      ),
      isMeteoDisplayed: getDefaultValueForConfigurationField(
        results[3],
        KEY_IS_METEO_DISPLAYED,
        true
      ),
      isDistanceDisplayed: getDefaultValueForConfigurationField(
        results[3],
        KEY_IS_DISTANCE_DISPLAYED,
        true
      ),
      isRegroupementDisplayed: getDefaultValueForConfigurationField(
        results[3],
        KEY_IS_REGROUPEMENT_DISPLAYED,
        true
      ),
      observateurs: results[4],
      departements: results[5],
      communes: mapCommunes(results[6]),
      lieudits: mapLieuxdits(results[7]),
      meteos: results[8],
      classes: results[9],
      especes: mapEspeces(results[10]),
      ages: results[11],
      sexes: results[12],
      estimationsNombre: mapEstimationsNombre(results[13]),
      estimationsDistance: results[14],
      comportements: results[15],
      milieux: results[16]
    };

    return creationPage;
  }
};

export const saveInventaire = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return creationPageCreateInventaireMock as any;
  } else {
    const inventaireToSave: Inventaire = httpParameters.postData;
    const { date, ...otherParams } = inventaireToSave;

    // It is an update we delete the current associes and meteos to insert later the updated ones
    if (!!inventaireToSave.id) {
      await SqlConnection.query(
        getDeleteEntityByAttributeQuery(
          TABLE_INVENTAIRE_ASSOCIE,
          "inventaire_id",
          inventaireToSave.id
        ) +
          getDeleteEntityByAttributeQuery(
            TABLE_INVENTAIRE_METEO,
            "inventaire_id",
            inventaireToSave.id
          )
      );
    }

    const inventaireResult = await SqlConnection.query(
      getSaveEntityQuery(
        TABLE_INVENTAIRE,
        {
          date: moment(date).format("YYYY-MM-DD"),
          dateCreation: moment().format("YYYY-MM-DD HH:mm:ss"),
          ...otherParams
        },
        DB_SAVE_MAPPING.inventaire
      )
    );

    // If it is an update we take the existing ID else we take the inserted ID
    const inventaireId: number = !!inventaireToSave.id
      ? inventaireToSave.id
      : (inventaireResult as any).insertId;

    if (inventaireToSave.associesIds.length > 0) {
      await SqlConnection.query(
        getSaveListOfEntitesQueries(
          TABLE_INVENTAIRE_ASSOCIE,
          inventaireId,
          inventaireToSave.associesIds
        )
      );
    }

    if (inventaireToSave.meteosIds.length > 0) {
      await SqlConnection.query(
        getSaveListOfEntitesQueries(
          TABLE_INVENTAIRE_METEO,
          inventaireId,
          inventaireToSave.meteosIds
        )
      );
    }

    return inventaireResult;
  }
};

export const saveDonnee = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return creationPageCreateDonneeMock as any;
  } else {
    const donneeToSave: Donnee = httpParameters.postData;

    // It is an update we delete the current comportements and milieux to insert later the updated ones
    if (!!donneeToSave.id) {
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

    const donneeResult = await SqlConnection.query(
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
    const donneeId: number = !!donneeToSave.id
      ? donneeToSave.id
      : (donneeResult as any).insertId;

    if (donneeToSave.comportementsIds.length > 0) {
      await SqlConnection.query(
        getSaveListOfEntitesQueries(
          TABLE_DONNEE_COMPORTEMENT,
          donneeId,
          donneeToSave.comportementsIds
        )
      );
    }

    if (donneeToSave.milieuxIds.length > 0) {
      await SqlConnection.query(
        getSaveListOfEntitesQueries(
          TABLE_DONNEE_MILIEU,
          donneeId,
          donneeToSave.milieuxIds
        )
      );
    }

    const savedDonneeResults: any = await SqlConnection.query(
      getFindDonneeByIdQuery(donneeId)
    );
    const savedDonnee: any = await buildDonneeFromFlatDonnee(
      savedDonneeResults[0]
    );

    return savedDonnee;
  }
};

export const deleteDonnee = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return { affectedRows: 1, insertId: 0, warningStatus: 0 };
  } else {
    const result = await SqlConnection.query(
      getDeleteEntityByIdQuery(TABLE_DONNEE, +httpParameters.queryParameters.id)
    );
    return result;
  }
};

export const getNextDonnee = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Donnee[]> => {
  if (isMockDatabaseMode) {
    return null;
  } else {
    const donneeResult = await SqlConnection.query(
      getFindNextDonneeByCurrentDonneeIdQuery(
        +httpParameters.queryParameters.id
      )
    );

    return await buildDonneeFromFlatDonnee(donneeResult[0]);
  }
};

export const getPreviousDonnee = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Donnee> => {
  if (isMockDatabaseMode) {
    return null;
  } else {
    const donneeResult = await SqlConnection.query(
      getFindPreviousDonneeByCurrentDonneeIdQuery(
        +httpParameters.queryParameters.id
      )
    );

    return await buildDonneeFromFlatDonnee(donneeResult[0]);
  }
};

const buildDonneeFromFlatDonnee = async (flatDonnee: any): Promise<any> => {
  const listsResults = await SqlConnection.query(
    getFindAssociesByInventaireIdQuery(flatDonnee.inventaireId) +
      getFindMetosByInventaireIdQuery(flatDonnee.inventaireId) +
      getFindComportementsByDonneeIdQuery(flatDonnee.id) +
      getFindMilieuxByDonneeIdQuery(flatDonnee.id) +
      getFindNumberOfDonneesByDoneeeEntityIdQuery(
        "inventaire_id",
        flatDonnee.inventaireId
      )
  );

  const inventaire: Inventaire = {
    id: flatDonnee.inventaireId,
    observateurId: flatDonnee.observateurId,
    associesIds: mapAssociesIds(listsResults[0]),
    date: flatDonnee.date,
    heure: flatDonnee.heure,
    duree: flatDonnee.duree,
    lieuditId: flatDonnee.lieuditId,
    altitude: flatDonnee.altitude,
    longitude: flatDonnee.longitude,
    latitude: flatDonnee.latitude,
    temperature: flatDonnee.temperature,
    meteosIds: mapMeteosIds(listsResults[1]),
    nbDonnees: listsResults[4][0].nbDonnees
  };

  const donnee: Donnee = {
    id: flatDonnee.id,
    inventaireId: flatDonnee.inventaireId,
    inventaire,
    especeId: flatDonnee.especeId,
    sexeId: flatDonnee.sexeId,
    ageId: flatDonnee.ageId,
    estimationNombreId: flatDonnee.estimationNombreId,
    nombre: flatDonnee.nombre,
    estimationDistanceId: flatDonnee.estimationDistanceId,
    distance: flatDonnee.distance,
    regroupement: flatDonnee.regroupement,
    comportementsIds: mapComportementsIds(listsResults[2]),
    milieuxIds: mapMilieuxIds(listsResults[3]),
    commentaire: flatDonnee.commentaire
  };
  return donnee;
};

export const getNextRegroupement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<number> => {
  if (isMockDatabaseMode) {
    return null;
  } else {
    const results = await SqlConnection.query(getFindLastRegroupementQuery());
    return (results[0].regroupement as number) + 1;
  }
};
