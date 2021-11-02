import { EventMast } from 'chillnn-sfa-abr';
import { IEventMastRepository } from 'chillnn-sfa-abr/dist/entities/repositories/modules/eventMastRepository';
import { DynamoDBRepositoryBase } from '../dynamoDBRepositoryBase';

export class DynamoDBEventMastRepository extends DynamoDBRepositoryBase<EventMast> implements IEventMastRepository {
    public addEvent(input: EventMast): Promise<EventMast> {
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

    public updateEvent(input: EventMast): Promise<EventMast> {
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

    public async fetchEventsByClientID(clientID: string): Promise<EventMast[]> {
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

    public async fetchEventsByEditedUserID(editedUserID: string): Promise<EventMast[]> {
        return await this.query({
            TableName: this.tableName,
            IndexName: DynamoDBRepositoryBase.UUIDIndexName,
            KeyConditionExpression: '#PK = :PK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
            },
            ExpressionAttributeValues: {
                ':PK': `Event#${editedUserID}`,
            },
        });
    }

    public async fetchAllEvent(): Promise<EventMast[]> {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
            },
            ExpressionAttributeValues: {
                ':PK': 'Event',
            },
        });
    }

    // ================================================
    // keys
    // ================================================
    protected getPK(input: EventMast): string {
        return 'Event';
    }
    protected getSK(input: EventMast): string {
        return `${input.createdAt}#${input.eventID}`;
    }
    protected getUUID(input: EventMast): string {
        return `${input.eventID}`;
    }
}
