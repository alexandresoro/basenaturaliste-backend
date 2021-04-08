import { Age } from "../../model/types/age.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { insertAges } from "../../sql-api/sql-api-age";
import { TABLE_AGE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_AGE;
  }

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (ages: Age[]): Promise<SqlSaveResponse> => {
    return insertAges(ages);
  };
}
