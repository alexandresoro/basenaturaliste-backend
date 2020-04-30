import * as _ from "lodash";
import { Comportement } from "ouca-common/comportement.object";
import { buildComportementsFromComportementsDb } from "../mapping/comportement-mapping";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToFindAllComportements,
  queryToFindNumberOfDonneesByComportementId
} from "../sql/sql-queries-comportement";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_COMPORTEMENT } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllComportements = async (): Promise<Comportement[]> => {
  const [comportementsDb, nbDonneesByComportement] = await Promise.all([
    queryToFindAllComportements(),
    queryToFindNumberOfDonneesByComportementId()
  ]);

  const comportements = buildComportementsFromComportementsDb(comportementsDb);

  _.forEach(comportements, (comportement: Comportement) => {
    comportement.nbDonnees = getNbByEntityId(
      comportement,
      nbDonneesByComportement
    );
  });

  return comportements;
};

export const persistComportement = async (
  comportement: Comportement
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_COMPORTEMENT,
    comportement,
    DB_SAVE_MAPPING.comportement
  );
};
