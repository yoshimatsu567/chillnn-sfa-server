import { EventMast } from 'chillnn-sfa-abr';
import { IEventMastRepository } from 'chillnn-sfa-abr/dist/entities/repositories/modules/eventMastRepository';
import { DynamoDBRepositoryBase } from '../dynamoDBRepositoryBase';
import { DynamoDBPhaseMastRepository } from './phaseMastRepository';

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

        public async deleteEvent(eventID: string): Promise<EventMast> {
                const current = await this.fetchEventByEventID(eventID);
                if (!current) {
                        throw new Error('404 Not Found');
                }
                return this.deleteItem({
                        TableName: this.tableName,
                        Key: this.getKey(current),
                });
        }

        public async fetchEventByEventID(eventID: string): Promise<EventMast | null> {
                const res = await this.query({
                        TableName: this.tableName,
                        IndexName: DynamoDBPhaseMastRepository.UUIDIndexName,
                        KeyConditionExpression: '#uuid = :uuid',
                        ExpressionAttributeNames: {
                                '#uuid': 'uuid',
                        },
                        ExpressionAttributeValues: {
                                ':uuid': eventID,
                        },
                });
                if (res.length) {
                        return res[0];
                } else {
                        return null;
                }
        }

        public async fetchEventsByClientID(clientID: string): Promise<EventMast[]> {
                return await this.query({
                        TableName: this.tableName,
                        KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
                        ExpressionAttributeNames: {
                                '#PK': 'PK',
                                '#SK': 'SK',
                        },
                        ExpressionAttributeValues: {
                                ':PK': 'Event',
                                ':SK': clientID,
                        },
                });
        }

        // GSI貼るなりしないと現状実現不可能
        public async fetchEventsByEditedUserID(editedUserID: string): Promise<EventMast[]> {
                return await this.query({
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
                // return `${input.eventID}#${input.createdAt}`;
                if (input.clientID !== undefined && input.clientID !== null && input.clientID !== '') {
                        return `${input.clientID}#${input.createdAt}`;
                } else {
                        return `${input.eventID}#${input.createdAt}`;
                }
        }
        protected getUUID(input: EventMast): string {
                return `${input.eventID}`;
        }
        // protected getPDS(input: EventMast): string {
        //         if (input. === '') {
        //                 return '';
        //         } else {
        //                 return `${input.eventDetail}`;
        //         }
        // }
}
