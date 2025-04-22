import { CosmosClient } from '@azure/cosmos';

// Initialize Cosmos DB client
const endpoint = process.env.COSMOSDB_ENDPOINT || '';
const key = process.env.COSMOSDB_KEY || '';
const databaseName = process.env.COSMOSDB_DATABASE || '';
const containerName = process.env.COSMOSDB_CONTAINER || '';

// Singleton pattern for CosmosClient
export const cosmosClient = new CosmosClient({ endpoint, key });
export const database = cosmosClient.database(databaseName);
export const container = database.container(containerName);

export interface TodoItem {
  id: string;
  pseudo: string;
  score: number;
  createdAt: string;
}