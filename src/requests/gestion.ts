import { Age } from "basenaturaliste-model/age.object";
import { Classe } from "basenaturaliste-model/classe.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { Comportement } from "basenaturaliste-model/comportement.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { EstimationDistance } from "basenaturaliste-model/estimation-distance.object";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { Meteo } from "basenaturaliste-model/meteo.object";
import { Milieu } from "basenaturaliste-model/milieu.object";
import { Observateur } from "basenaturaliste-model/observateur.object";
import { Sexe } from "basenaturaliste-model/sexe.object";
import * as _ from "lodash";
import * as mysql from "mysql";
import agesMock from "../mocks/gestion-base-pages/ages.json";
import classesMock from "../mocks/gestion-base-pages/classes.json";
import communesMock from "../mocks/gestion-base-pages/communes.json";
import comportementsMock from "../mocks/gestion-base-pages/comportements.json";
import departementsMock from "../mocks/gestion-base-pages/departements.json";
import especesMock from "../mocks/gestion-base-pages/especes.json";
import estimationsDistanceMock from "../mocks/gestion-base-pages/estimations-distance.json";
import estimationsNombreMock from "../mocks/gestion-base-pages/estimations-nombre.json";
import lieuxDitsMock from "../mocks/gestion-base-pages/lieuxdits.json";
import meteosMock from "../mocks/gestion-base-pages/meteos.json";
import milieuxMock from "../mocks/gestion-base-pages/milieux.json";
import observateursMock from "../mocks/gestion-base-pages/observateurs.json";
import sexesMock from "../mocks/gestion-base-pages/sexes.json";
import { getAllFromTablesQuery, SqlConnection } from "../sql/sql-connection.js";

export function getObservateurs(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Observateur[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, observateursMock as Observateur[]);
  } else {
    // TODO
  }
}

export function getDepartements(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Departement[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, departementsMock as Departement[]);
  } else {
    // TODO
  }
}

export function getCommunes(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Commune[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, communesMock as any[]);
  } else {
    // TODO
  }
}

export function getLieuxDits(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Lieudit[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, lieuxDitsMock as Lieudit[]);
  } else {
    // TODO
  }
}

export function getMeteos(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Meteo[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, meteosMock as Meteo[]);
  } else {
    // TODO
  }
}

export function getClasses(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Classe[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, classesMock as Classe[]);
  } else {
    // TODO
  }
}

export function getEspeces(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Espece[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, especesMock as Espece[]);
  } else {
    // TODO
  }
}

export function getSexes(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Sexe[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, sexesMock as Sexe[]);
  } else {
    // TODO
  }
}

export function getAges(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Age[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, agesMock as Age[]);
  } else {
    // TODO
  }
}

export function getEstimationsNombre(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: EstimationNombre[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, estimationsNombreMock as EstimationNombre[]);
  } else {
    // TODO
  }
}

export function getEstimationsDistance(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: EstimationDistance[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, estimationsDistanceMock as EstimationDistance[]);
  } else {
    // TODO
  }
}

export function getComportements(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Comportement[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, comportementsMock as Comportement[]);
  } else {
    // TODO
  }
}

export function getMilieux(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Milieu[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, milieuxMock as Milieu[]);
  } else {
    // TODO
  }
}
