import { DynamoDBRepositoryBase } from '@/driver/dynamodb/dynamoDBRepositoryBase';
import { DynamoDBPhaseMastRepository } from '@/driver/dynamodb/modules/phaseMastRepository';

export const phaseMastRepository = new DynamoDBPhaseMastRepository(DynamoDBRepositoryBase.MASTER_TABLE_NAME);
