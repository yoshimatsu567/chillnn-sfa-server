import { DynamoDBRepositoryBase } from '@/driver/dynamodb/dynamoDBRepositoryBase';
import { DynamoDBUserMastRepository } from '@/driver/dynamodb/modules/userMastRepository';

export const userMastRepository = new DynamoDBUserMastRepository(DynamoDBRepositoryBase.MASTER_TABLE_NAME);
