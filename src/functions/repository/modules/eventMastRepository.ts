import { DynamoDBRepositoryBase } from '@/driver/dynamodb/dynamoDBRepositoryBase';
import { DynamoDBEventMastRepository } from '@/driver/dynamodb/modules/eventMastRepository copy';

export const eventMastRepository = new DynamoDBEventMastRepository(DynamoDBRepositoryBase.MASTER_TABLE_NAME);
