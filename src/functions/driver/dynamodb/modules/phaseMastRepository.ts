import { PhaseMast, PHASE_STATUS } from 'chillnn-sfa-abr';
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
                                pds: this.getPDS(input),
                                pacid: this.getPACID(input),
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
                                pds: this.getPDS(input),
                                pacid: this.getPACID(input),
                                ...input,
                        },
                        ConditionExpression: 'attribute_exists(#PK) AND attribute_exists(#SK)',
                        ExpressionAttributeNames: {
                                '#PK': 'PK',
                                '#SK': 'SK',
                        },
                });
        }

        public async deletePhase(phaseID: string): Promise<PhaseMast> {
                const current = await this.fetchPhaseByPhaseID(phaseID);
                if (!current) {
                        throw new Error('404 Not Found');
                }
                return this.deleteItem({
                        TableName: this.tableName,
                        Key: this.getKey(current),
                });
        }

        public async fetchPhaseByPhaseID(phaseID: string): Promise<PhaseMast | null> {
                const res = await this.query({
                        TableName: this.tableName,
                        IndexName: DynamoDBPhaseMastRepository.UUIDIndexName,
                        KeyConditionExpression: '#uuid = :uuid',
                        ExpressionAttributeNames: {
                                '#uuid': 'uuid',
                        },
                        ExpressionAttributeValues: {
                                ':uuid': phaseID,
                        },
                });
                if (res.length) {
                        return res[0];
                } else {
                        return null;
                }
        }

        public async fetchPhaseDataByClientID(clientID: string): Promise<PhaseMast[]> {
                return await this.query({
                        TableName: this.tableName,
                        KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
                        ExpressionAttributeNames: {
                                '#PK': 'PK',
                                '#SK': 'SK',
                        },
                        ExpressionAttributeValues: {
                                ':PK': 'Phase',
                                ':SK': clientID,
                        },
                });
        }

        // 追加したGSIのやつ
        public async fetchPhaseDataByClientIDAndPhaseDetail(clientID: string, phaseDetail: string): Promise<PhaseMast | null> {
                const res = await this.query({
                        TableName: this.tableName,
                        IndexName: DynamoDBRepositoryBase.PHASE_AND_CLIENTID_IndexName,
                        KeyConditionExpression: '#pacid = :pacid AND #pds = :pds',
                        ExpressionAttributeNames: {
                                '#pacid': 'pacid',
                                '#pds': 'pds',
                        },
                        ExpressionAttributeValues: {
                                ':pacid': `Phase#${clientID}`,
                                ':pds': `${phaseDetail}`,
                        },
                });

                if (res.length) {
                        return res[0];
                } else {
                        return null;
                }
        }

        // 現状GSI貼らないと実現不可能
        public async fetchPhaseDataByEditedUserID(editedUserID: string): Promise<PhaseMast[]> {
                return await this.query({
                        TableName: this.tableName,
                        KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
                        ExpressionAttributeNames: {
                                '#PK': 'PK',
                                '#SK': 'SK',
                        },
                        ExpressionAttributeValues: {
                                ':PK': 'Phase',
                                ':SK': editedUserID,
                        },
                });
        }

        // phaseStatus='TITLE'のデータはfrontではじく
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
                if (input.clientID !== null && input.clientID !== '' && input.clientID !== undefined) {
                        return `${input.clientID}#${input.createdAt}`;
                } else {
                        return `${input.phaseID}#${input.createdAt}`;
                }
        }
        protected getUUID(input: PhaseMast): string {
                return `${input.phaseID}`;
        }
        protected getPACID(input: PhaseMast): string {
                if (input.phaseStatus === ('TITLE' as PHASE_STATUS) || input.phaseStatus === ('DEAD' as PHASE_STATUS)) {
                        return 'none';
                } else {
                        return `Phase#${input.clientID}`;
                }
        }
        protected getPDS(input: PhaseMast): string {
                return `${input.phaseDetail}`;
        }
}
