import * as _ from "lodash";
import { Commune } from "ouca-common/commune.model";
import {
  buildCommuneFromCommuneDb,
  buildCommunesFromCommunesDb
} from "../mapping/commune-mapping";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindCommuneByDepartementIdAndCode,
  getQueryToFindCommuneByDepartementIdAndCodeAndNom,
  getQueryToFindCommuneByDepartementIdAndNom,
  getQueryToFindNumberOfDonneesByCommuneId,
  getQueryToFindNumberOfLieuxditsByCommuneId
} from "../sql/sql-queries-commune";
import { getFindAllQuery } from "../sql/sql-queries-utils";
import { COLUMN_NOM, ORDER_ASC, TABLE_COMMUNE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";

export const findAllCommunes = async (): Promise<Commune[]> => {
  const [
    communesDb,
    nbLieuxditsByCommuneDb,
    nbDonneesByCommuneDb
  ] = await Promise.all(
    _.flatten([
      SqlConnection.query(
        getFindAllQuery(TABLE_COMMUNE, COLUMN_NOM, ORDER_ASC)
      ),
      SqlConnection.query(getQueryToFindNumberOfLieuxditsByCommuneId()),
      SqlConnection.query(getQueryToFindNumberOfDonneesByCommuneId())
    ])
  );

  const communes: Commune[] = buildCommunesFromCommunesDb(communesDb);
  const nbLieuxditsByCommune: NumberOfObjectsById[] = nbLieuxditsByCommuneDb;
  const nbDonneesByCommune: NumberOfObjectsById[] = nbDonneesByCommuneDb;

  _.forEach(communes, (commune: Commune) => {
    commune.nbLieuxdits = getNbByEntityId(commune, nbLieuxditsByCommune);
    commune.nbDonnees = getNbByEntityId(commune, nbDonneesByCommune);
  });

  return communes;
};

export const getCommuneByDepartementIdAndCodeAndNom = async (
  departementId: number,
  code: number,
  nom: string
): Promise<Commune> => {
  const results = await SqlConnection.query(
    getQueryToFindCommuneByDepartementIdAndCodeAndNom(departementId, code, nom)
  );

  let commune: Commune = null;

  if (results && results[0] && results[0].id) {
    commune = buildCommuneFromCommuneDb(results[0]);
  }

  return commune;
};

export const getCommuneByDepartementIdAndCode = async (
  departementId: number,
  code: number
): Promise<Commune> => {
  const results = await SqlConnection.query(
    getQueryToFindCommuneByDepartementIdAndCode(departementId, code)
  );

  let commune: Commune = null;

  if (results && results[0] && results[0].id) {
    commune = buildCommuneFromCommuneDb(results[0]);
  }

  return commune;
};

export const getCommuneByDepartementIdAndNom = async (
  departementId: number,
  nom: string
): Promise<Commune> => {
  const results = await SqlConnection.query(
    getQueryToFindCommuneByDepartementIdAndNom(departementId, nom)
  );

  let commune: Commune = null;

  if (results && results[0] && results[0].id) {
    commune = buildCommuneFromCommuneDb(results[0]);
  }

  return commune;
};
