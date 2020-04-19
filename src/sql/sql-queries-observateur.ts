import { Observateur } from "ouca-common/observateur.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_LIBELLE,
  OBSERVATEUR_ID,
  ORDER_ASC,
  TABLE_OBSERVATEUR
} from "../utils/constants";
import { getQueryToFindNumberOfDonneesByInventaireEntityId } from "./sql-queries-inventaire";
import { getQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllObservateurs = async (): Promise<Observateur[]> => {
  return queryToFindAllEntities<Observateur>(
    TABLE_OBSERVATEUR,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export function getQueryToFindAssociesByInventaireId(
  inventaireId: number
): string {
  return getQuery(
    "SELECT distinct observateur_id as associeId FROM inventaire_associe WHERE inventaire_id=" +
      inventaireId
  );
}

export const queryToFindNumberOfDonneesByObservateurId = async (
  observateurId?: number
): Promise<NumberOfObjectsById[]> => {
  return query<NumberOfObjectsById[]>(
    getQueryToFindNumberOfDonneesByInventaireEntityId(
      OBSERVATEUR_ID,
      observateurId
    )
  );
};

export function getQueryToFindAllAssocies(donneesIds?: number[]): string {
  let query: string =
    "SELECT d.id as donneeId, o.libelle" +
    " FROM inventaire_associe i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN observateur o ON i.observateur_id = o.id";

  if (donneesIds && donneesIds.length) {
    query = query + " WHERE d.id IN (" + donneesIds.join(",") + ")";
  }

  return getQuery(query);
}
