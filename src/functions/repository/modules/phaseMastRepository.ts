import { DynamoDBRepositoryBase } from '@/driver/dynamodb/dynamoDBRepositoryBase';
import { DynamoDBPhaseMastRepository } from '@/driver/dynamodb/modules/phaseMastRepository copy';

export const phaseMastRepository = new DynamoDBPhaseMastRepository(DynamoDBRepositoryBase.MASTER_TABLE_NAME);
