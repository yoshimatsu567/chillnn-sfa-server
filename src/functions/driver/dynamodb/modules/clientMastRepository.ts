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
                                pds: this.getPDS(input),
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
                                pds: this.getPDS(input),
                                ...input,
                        },
                        ConditionExpression: 'attribute_exists(#PK) AND attribute_exists(#SK)',
                        ExpressionAttributeNames: {
                                '#PK': 'PK',
                                '#SK': 'SK',
                        },
                });
        }

        public async deleteClient(clientID: string): Promise<ClientMast> {
                const current = await this.fetchClientByClientID(clientID);
                if (!current || current !== null) {
                        throw new Error('404 Not Found');
                } else {
                        return this.deleteItem({
                                TableName: this.tableName,
                                Key: {
                                        PK: this.getPK(current),
                                        SK: this.getSK(current),
                                },
                                ReturnValues: 'ALL_OLD',
                        });
                }
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

        // 変更加えないと実現不可能
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

        // 変更加えないと実現不可能
        public async fetchClientsByContentSearch(phaseContent: FetchClientsByPhaseInput) {
                return this.query({
                        TableName: this.tableName,
                        KeyConditionExpression: '#PK = :PK',
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

        //　追加したGSIのやつ
        public async fetchClientsByPhaseDetailStatus(phaseDetail: string): Promise<ClientMast[] | null> {
                const res = await this.query({
                        TableName: this.tableName,
                        IndexName: DynamoDBRepositoryBase.PHASE_DETAIL_STATUSIndexName,
                        KeyConditionExpression: '#pds = :pds AND #PK = :PK',
                        ExpressionAttributeNames: {
                                '#pds': 'pds',
                                '#PK': 'PK',
                        },
                        ExpressionAttributeValues: {
                                ':pds': phaseDetail,
                                ':PK': 'Client',
                        },
                });

                if (res.length) {
                        return res;
                } else {
                        return null;
                }
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
        // ===============================================================================
        // Clientの最新のPhaseDetailStatusを持っておく。Modelの責務的にいいのかは現段階ではわからない。
        // Clientのみの場合値はないので、そういうことも許容しておく
        // ===============================================================================
        protected getPDS(input: ClientMast): string {
                if (input.phaseDetailStatus === '') {
                        return '';
                } else {
                        return `${input.phaseDetailStatus}`;
                }
        }
}
