import { ClientMast, FetchClientsByPhaseInput } from 'chillnn-sfa-abr';
import { IClientMastRepository } from 'chillnn-sfa-abr/dist/entities/repositories/modules/clientMastRepository';
import { DynamoDBRepositoryBase } from '../dynamoDBRepositoryBase';

export class DynamoDBClientMastRepository extends DynamoDBRepositoryBase<ClientMast> implements IClientMastRepository {
    public addClient(input: ClientMast): Promise<ClientMast> {
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

    public updateClient(input: ClientMast): Promise<ClientMast> {
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

    public async fetchClientByClientID(clientID: string): Promise<ClientMast | null> {
        const res = await this.query({
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
        if (res.length) {
            return res[0];
        } else {
            return null;
        }
    }

    public async fetchClientsByChargeUserID(chargeUserID: string): Promise<ClientMast[]> {
        return await this.query({
            TableName: this.tableName,
            IndexName: DynamoDBRepositoryBase.UUIDIndexName,
            KeyConditionExpression: '#PK = :PK and #SK = :SK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#SK': 'SK',
            },
            ExpressionAttributeValues: {
                ':PK': 'Client',
                ':SK': chargeUserID,
            },
        });
    }

    public async fetchAllClient(): Promise<ClientMast[]> {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
            },
            ExpressionAttributeValues: {
                ':PK': 'Client',
            },
        });
    }

    public async fetchClientsByContentSearch(phaseContent: FetchClientsByPhaseInput) {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            FilterExpression: 'contains(#PC, :PC)',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#PC': 'phaseContent',
            },
            ExpressionAttributeValues: {
                ':PK': 'Client',
                ':PC': phaseContent,
            },
        });
    }

    public async fetchClientsByPhaseStatus(phaseStatus: string) {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            FilterExpression: 'contains(#PS, :PS)',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#PS': 'phaseStatus',
            },
            ExpressionAttributeValues: {
                ':PK': 'Client',
                ':ps': phaseStatus,
            },
        });
    }

    public async fetchClientsByPhaseNumber(phaseNumber: number) {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            FilterExpression: 'contains(#PN, :PN)',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#PN': 'phaseNumber',
            },
            ExpressionAttributeValues: {
                ':PK': 'Client',
                ':PN': phaseNumber,
            },
        });
    }

    public async fetchClientsByPhaseDetail(phaseDetail: string) {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            FilterExpression: 'contains(#PD, :PD)',
            ExpressionAttributeNames: {
                '#PK': 'PK',
                '#PD': 'PD',
            },
            ExpressionAttributeValues: {
                ':PK': 'Client',
                ':PD': phaseDetail,
            },
        });
    }

    // ================================================
    // keys
    // ================================================
    protected getPK(_input: ClientMast): string {
        return 'Client';
    }
    protected getSK(input: ClientMast): string {
        return `${input.createdAt}#${input.clientID}`;
    }
    protected getUUID(input: ClientMast): string {
        return `${input.clientID}`;
    }
}
