import { ICommuneDocument } from "basenaturaliste-model/mongo/ICommuneDocument";
import { ILieuDitDocument } from "basenaturaliste-model/mongo/ILieuDitDocument";
import MongoConnection from "./mongo-connection";
import { COMMUNES_COLLECTION, LIEUX_DITS_COLLECTION } from "./mongo-databases";
import { ObjectId } from "mongodb";
import _ from "lodash";

export const findCommunesByDepartementIds = async (
  departementsIds: (string | ObjectId)[] = []
): Promise<ICommuneDocument[]> => {
  return MongoConnection.getCollection<ICommuneDocument>(COMMUNES_COLLECTION)
    .find({
      departementId: { $in: _.map(departementsIds, id => new ObjectId(id)) }
    })
    .toArray();
};

export const findLieuxDitsByCommunesIds = async (
  communesIds: (string | ObjectId)[] = []
): Promise<ILieuDitDocument[]> => {
  return MongoConnection.getCollection<ILieuDitDocument>(LIEUX_DITS_COLLECTION)
    .find({
      communeId: { $in: _.map(communesIds, id => new ObjectId(id)) }
    })
    .toArray();
};
