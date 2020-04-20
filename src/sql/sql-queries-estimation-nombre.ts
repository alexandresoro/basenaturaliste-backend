import { EstimationNombreDb } from "../objects/db/estimation-nombre-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_LIBELLE,
  ORDER_ASC,
  TABLE_ESTIMATION_NOMBRE
} from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllEstimationsNombre = async (): Promise<
  EstimationNombreDb[]
> => {
  return queryToFindAllEntities<EstimationNombreDb>(
    TABLE_ESTIMATION_NOMBRE,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export const queryToFindNumberOfDonneesByEstimationNombreId = async (
  estimationId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId(
    "estimation_nombre_id",
    estimationId
  );
};
