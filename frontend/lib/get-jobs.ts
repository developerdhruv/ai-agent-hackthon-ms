import { MongoClient } from 'mongodb';
import { JobRecommendation } from './types';  

const uri = process.env.COSMOS_DB_URI as string;
const client = new MongoClient(uri);

const databaseName = process.env.COSMOS_DB_NAME;
const collectionName = "career-pilot-db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let database: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let collection: any;

async function connectToDatabase() {
  // Ensure we connect only once
  if (!database) {
    await client.connect();
    database = client.db(databaseName);
    collection = database.collection(collectionName);
  }
}

export async function fetchJobRecommendations(): Promise<JobRecommendation[]> {
  try {
    // Connect to Cosmos DB
    await connectToDatabase();

    const documents = await collection.find({}).toArray() as JobRecommendation[];

    return documents; 
  } catch (error) {
    console.error("Error fetching data from Cosmos DB:", error);
    return [];
  }
}


fetchJobRecommendations().then(jobRecommendations => {
  console.log("Fetched job recommendations:", jobRecommendations);
});
