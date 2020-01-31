import _ from "lodash";
import MongoConnection from "./mongo-connection";
import { BaseNaturalisteCollectionName } from "./mongo-databases";
import { IDocumentWithObjectId } from "basenaturaliste-model/mongo/IDocumentWithObjectId";

/**
 * Method that retrieves all elements of a given collection
 */
export const getAllEntriesFromCollection = async <
  TSchema extends IDocumentWithObjectId
>(
  collection: BaseNaturalisteCollectionName
): Promise<TSchema[]> => {
  return await MongoConnection.getCollection<TSchema>(collection)
    .find({})
    .toArray();
};

export const getAllEntriesFromMultipleCollections = async (
  collections: BaseNaturalisteCollectionName[]
): Promise<Partial<
  Record<BaseNaturalisteCollectionName, IDocumentWithObjectId[]>
>> => {
  const queryResults = await Promise.all(
    collections.map(getAllEntriesFromCollection)
  );
  return _.zipObject(collections, queryResults);
};
