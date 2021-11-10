import { PhaseMast } from 'chillnn-sfa-abr';
import { IPhaseMastRepository } from 'chillnn-sfa-abr/dist/entities/repositories/modules/phaseMastRepository';
import { DynamoDBRepositoryBase } from '../dynamoDBRepositoryBase';

export class DynamoDBPhaseMastRepository extends DynamoDBRepositoryBase<PhaseMast> implements IPhaseMastRepository {
    public addPhase(input: PhaseMast): Promise<PhaseMast> {
        return this.putItem({
            TableName: this.tableName,
            Item: {
                PK: this.getPK(input),
                SK: this.getSK(input),
                uuid: this.getUUID(input),
                ...input,
            },
            ConditionExpression: 'attribute_not_exists(#PK) AND attribute_not_exists(#SK)',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#SK': 'SK',
            },
        });
    }

    public updatePhase(input: PhaseMast): Promise<PhaseMast> {
        return this.putItem({
            TableName: this.tableName,
            Item: {
                PK: this.getPK(input),
                SK: this.getSK(input),
                uuid: this.getUUID(input),
                ...input,
            },
            ConditionExpression: 'attribute_exists(#PK) AND attribute_exists(#SK)',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#SK': 'SK',
            },
        });
    }

    public async fetchPhasesByClientID(clientID: string): Promise<PhaseMast[]> {
        return await this.query({
            TableName: this.tableName,
            IndexName: DynamoDBRepositoryBase.UUIDIndexName,
            KeyConditionExpression: '#uuid = :uuid',
            ExpressionAttributeNames: {
                '#uuid': 'uuid',
            },
            ExpressionAttributeValues: {
                ':uuid': clientID,
            },
        });
    }

    public async fetchPhasesByEditedUserID(editedUserID: string): Promise<PhaseMast[]> {
        return await this.query({
            TableName: this.tableName,
            IndexName: DynamoDBRepositoryBase.UUIDIndexName,
            KeyConditionExpression: '#PK = :PK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
            },
            ExpressionAttributeValues: {
                ':PK': `Phase#${editedUserID}`,
            },
        });
    }

    public async fetchAllPhase(): Promise<PhaseMast[]> {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
            },
            ExpressionAttributeValues: {
                ':PK': 'Phase',
            },
        });
    }

    // ================================================
    // keys
    // ================================================
    protected getPK(_input: PhaseMast): string {
        return 'Phase';
    }
    protected getSK(input: PhaseMast): string {
        return `${input.createdAt}#${input.phaseID}`;
    }
    protected getUUID(input: PhaseMast): string {
        return `${input.phaseID}`;
    }
}
