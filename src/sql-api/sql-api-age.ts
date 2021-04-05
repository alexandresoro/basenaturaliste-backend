import { Age } from "../model/types/age.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllAges, queryToFindNumberOfDonneesByAgeId } from "../sql/sql-queries-age";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_AGE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { insertMultipleEntities, persistEntity } from "./sql-api-common";

export const findAllAges = async (): Promise<Age[]> => {
  const [ages, nbDonneesByAge] = await Promise.all([
    queryToFindAllAges(),
    queryToFindNumberOfDonneesByAgeId()
  ]);

  ages.forEach((age: Age) => {
    age.nbDonnees = getNbByEntityId(age, nbDonneesByAge);
  });

  return ages;
};

export const persistAge = async (age: Age): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_AGE, age, DB_SAVE_MAPPING.get("age"));
};

export const insertAges = async (
  ages: Age[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_AGE, ages, DB_SAVE_MAPPING.get("age"));
};
