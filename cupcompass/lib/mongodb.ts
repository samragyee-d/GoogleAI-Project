import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI");
}

let clientPromise: Promise<MongoClient>;

const globalForMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalForMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalForMongo._mongoClientPromise = client.connect();
}

clientPromise = globalForMongo._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "cupcompass");
}