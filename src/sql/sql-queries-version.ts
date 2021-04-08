import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { getFirstResult, query } from "./sql-queries-utils";

export const queryToCreateVersionTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS version (" +
    " version SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY(version)" +
    " )");
}

export const queryToInitializeVersionTable = async (): Promise<void> => {
  return query<void>("INSERT INTO version VALUES (0)");
}

export const queryToFindVersion = async (): Promise<number> => {
  const queryStr =
    `SELECT * FROM version`;
  const results = await query<{ version: number }[]>(queryStr);
  return getFirstResult<{ version: number }>(results).version;
};

export const queryToUpdateVersion = async (version: number): Promise<SqlSaveResponse> => {
  const queryStr = `UPDATE version SET version=${version}`;
  return query<SqlSaveResponse>(queryStr);
};
