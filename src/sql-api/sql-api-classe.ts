import * as _ from "lodash";
import { Classe } from "ouca-common/classe.object";
import {
  queryToFindAllClasses,
  queryToFindNumberOfDonneesByClasseId,
  queryToFindNumberOfEspecesByClasseId
} from "../sql/sql-queries-classe";
import { TABLE_CLASSE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { getEntityByLibelle } from "./sql-api-common";

export const findAllClasses = async (): Promise<Classe[]> => {
  const [classes, nbEspecesByClasse, nbDonneesByClasse] = await Promise.all([
    queryToFindAllClasses(),
    queryToFindNumberOfEspecesByClasseId(),
    queryToFindNumberOfDonneesByClasseId()
  ]);

  _.forEach(classes, (classe: Classe) => {
    classe.nbEspeces = getNbByEntityId(classe, nbEspecesByClasse);
    classe.nbDonnees = getNbByEntityId(classe, nbDonneesByClasse);
  });

  return classes;
};

export const getClasseByLibelle = async (libelle: string): Promise<Classe> => {
  return await getEntityByLibelle<Classe>(libelle, TABLE_CLASSE);
};
