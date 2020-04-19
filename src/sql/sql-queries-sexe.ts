import { Sexe } from "ouca-common/sexe.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_SEXE } from "../utils/constants";
import { queryToFindNumberOfDonneesByDoneeeEntityId } from "./sql-queries-donnee";
import { queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllSexes = async (): Promise<Sexe[]> => {
  return queryToFindAllEntities<Sexe>(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC);
};

export const queryToFindNumberOfDonneesBySexeId = async (
  sexeId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDoneeeEntityId("sexe_id", sexeId);
};
