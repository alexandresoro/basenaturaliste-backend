import { EstimationDistance } from "@ou-ca/ouca-model/estimation-distance.object";
import * as _ from "lodash";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { getQueryToFindNumberOfDonneesByEstimationDistanceId, queryToFindAllEstimationsDistance } from "../sql/sql-queries-estimation-distance";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_ESTIMATION_DISTANCE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllEstimationsDistance = async (): Promise<
  EstimationDistance[]
> => {
  const [estimations, nbDonneesByEstimation] = await Promise.all([
    queryToFindAllEstimationsDistance(),
    getQueryToFindNumberOfDonneesByEstimationDistanceId()
  ]);

  _.forEach(estimations, (estimation: EstimationDistance) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
};

export const persistEstimationDistance = async (
  estimation: EstimationDistance
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_ESTIMATION_DISTANCE,
    estimation,
    DB_SAVE_MAPPING.estimationDistance
  );
};
