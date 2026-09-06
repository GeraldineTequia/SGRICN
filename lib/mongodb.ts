import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Falta la variable de entorno MONGODB_URI");
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Obtiene la base de datos de MongoDB.
 *
 * El nombre de la base de datos se toma de MONGODB_DB.
 * Si no existe, MongoDB utilizará la base de datos definida
 * en la cadena MONGODB_URI.
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;

  if (process.env.MONGODB_DB) {
    return client.db(process.env.MONGODB_DB);
  }

  return client.db();
}

export default clientPromise;
