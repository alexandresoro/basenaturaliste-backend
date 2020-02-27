import { Departement } from "ouca-common/departement.object";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindDepartementByCode } from "../sql/sql-queries-departement";

export const getDepartementByCode = async (
  code: string
): Promise<Departement> => {
  const results = await SqlConnection.query(
    getQueryToFindDepartementByCode(code)
  );

  let departement: Departement = null;
  if (results && results[0] && results[0].id) {
    departement = results[0];
  }

  return departement;
};
