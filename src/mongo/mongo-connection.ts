import { MongoClient, Db, Collection } from "mongodb";
import { BaseNaturalisteCollectionName } from "./mongo-databases";
import { IDocumentWithObjectId } from "basenaturaliste-model/mongo/IDocumentWithObjectId";

export const DEFAULT_DATABASE_NAME = "basenaturaliste";

export default class MongoConnection {
  // The current database connection
  private static connection: MongoClient | null | undefined;

  public static async initializeConnection(argv: {
    dbHost: string;
    dbPort: string;
  }): Promise<MongoClient> {
    const mongoConnectionUrl =
      "mongodb://" + argv.dbHost + ":" + argv.dbPort + "/";
    this.connection = new MongoClient(mongoConnectionUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await this.connection.connect();

    console.log(
      `Connected to database with address ${argv.dbHost}:${argv.dbPort}`
    );

    return this.connection;
  }

  private static getDatabase(): Db {
    if (!this.connection) {
      process.exit(1);
    }

    return this.connection.db(DEFAULT_DATABASE_NAME);
  }

  public static getCollection<TSchema extends IDocumentWithObjectId>(
    collectionName: BaseNaturalisteCollectionName
  ): Collection<TSchema> {
    return this.getDatabase().collection<TSchema>(collectionName);
  }
}
