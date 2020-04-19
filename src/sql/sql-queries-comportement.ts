import { Comportement } from "ouca-common/comportement.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_LIBELLE,
  ORDER_ASC,
  TABLE_COMPORTEMENT
} from "../utils/constants";
import { getQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllComportements = async (): Promise<
  Comportement[]
> => {
  return queryToFindAllEntities<Comportement>(
    TABLE_COMPORTEMENT,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export const queryToFindAllComportementsByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; code: string; libelle: string }[]> => {
  let queryStr: string =
    "SELECT d.donnee_id as donneeId, c.code, c.libelle" +
    " FROM donnee_comportement d" +
    " INNER JOIN comportement c ON d.comportement_id = c.id";

  if (donneesIds && donneesIds.length) {
    queryStr =
      queryStr + " WHERE d.donnee_id IN (" + donneesIds.join(",") + ")";
  }

  return query<{ donneeId: number; code: string; libelle: string }[]>(queryStr);
};

export function getQueryToFindComportementsIdsByDonneeId(
  donneeId: number
): string {
  return getQuery(
    "SELECT distinct comportement_id as comportementId FROM donnee_comportement WHERE donnee_id=" +
      donneeId
  );
}

export const getQueryToFindNumberOfDonneesByComportementId = async (
  comportementId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT dc.comportement_id as id, count(*) as nb " +
    "FROM donnee_comportement dc ";
  if (comportementId) {
    queryStr = queryStr + " WHERE dc.comportement_id=" + comportementId;
  } else {
    queryStr = queryStr + " GROUP BY dc.comportement_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
