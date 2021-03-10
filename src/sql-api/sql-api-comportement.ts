import { buildComportementDbFromComportement, buildComportementsFromComportementsDb } from "../mapping/comportement-mapping";
import { Comportement } from "../model/types/comportement.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllComportements, queryToFindNumberOfDonneesByComportementId } from "../sql/sql-queries-comportement";
import { TABLE_COMPORTEMENT } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllComportements = async (): Promise<Comportement[]> => {
  const [comportementsDb, nbDonneesByComportement] = await Promise.all([
    queryToFindAllComportements(),
    queryToFindNumberOfDonneesByComportementId()
  ]);

  const comportements = buildComportementsFromComportementsDb(comportementsDb);

  comportements.forEach((comportement: Comportement) => {
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
  const comportementDb = buildComportementDbFromComportement(comportement);
  return persistEntity(TABLE_COMPORTEMENT, comportementDb);
};
