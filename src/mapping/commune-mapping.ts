import { Commune } from "@ou-ca/ouca-model/commune.model";
import * as _ from "lodash";
import { CommuneDb } from "../objects/db/commune-db.object";

export const buildCommuneFromCommuneDb = (communeDb: CommuneDb): Commune => {
  return {
    id: communeDb.id,
    departementId: communeDb.departement_id,
    code: communeDb.code,
    nom: communeDb.nom
  };
};

export const buildCommunesFromCommunesDb = (
  communesDb: CommuneDb[]
): Commune[] => {
  return _.map(communesDb, (communeDb) => {
    return buildCommuneFromCommuneDb(communeDb);
  });
};
