import { DynamoDBRepositoryBase } from '@/driver/dynamodb/dynamoDBRepositoryBase';
import { DynamoDBClientMastRepository } from '@/driver/dynamodb/modules/clientMastRepository';

export const clientMastRepository = new DynamoDBClientMastRepository(DynamoDBRepositoryBase.MASTER_TABLE_NAME);
