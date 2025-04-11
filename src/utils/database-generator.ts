import { MongoClient } from "mongodb";

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) throw new Error("Please define MONGODB_URI in the .env file.");

const isProd = process.env.NODE_ENV === "production";
const certPath = isProd
  ? "/etc/secrets/mongodb.pem"
  : "./etc/secrets/mongodb.pem";

const mongoClient = new MongoClient(mongoURI, {
  tlsCertificateKeyFile: certPath,
});
const database = mongoClient.db(process.env.MONGODB_DATABASE);

export default database;
