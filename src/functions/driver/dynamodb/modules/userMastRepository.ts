import { IUserMastRepository } from 'chillnn-sfa-abr';
import { UserMast } from 'chillnn-sfa-abr/dist/entities/type';
import { DynamoDBRepositoryBase } from '../dynamoDBRepositoryBase';

export class DynamoDBUserMastRepository extends DynamoDBRepositoryBase<UserMast> implements IUserMastRepository {
    public addUserMast(input: UserMast): Promise<UserMast> {
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
    public updateUserMast(input: UserMast): Promise<UserMast> {
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
    public fetchMyUserMast(): Promise<UserMast | null> {
        // server sideでは実行不可能
        throw new Error('Method not implemented.');
    }
    public async fetchUserMastByUserID(userID: string): Promise<UserMast | null> {
        const res = await this.query({
            TableName: this.tableName,
            IndexName: DynamoDBRepositoryBase.UUIDIndexName,
            KeyConditionExpression: '#uuid = :uuid',
            ExpressionAttributeNames: {
                '#uuid': 'uuid',
            },
            ExpressionAttributeValues: {
                ':uuid': userID,
            },
        });
        if (res.length) {
            return res[0];
        } else {
            return null;
        }
    }

    public fetchAllUser(): Promise<UserMast[]> {
        return this.query({
            TableName: this.tableName,
            KeyConditionExpression: '#PK = :PK',
            ExpressionAttributeNames: {
                '#PK': 'PK',
            },
            ExpressionAttributeValues: {
                ':PK': 'User',
            },
        });
    }

    // async fetchUsersMastByPhaseNumber(phaseNumber: number): Promise<UserMast[]> {
    //     return this.query({
    //         TableName: this.tableName,
    //         KeyConditionExpression: '#PK = :PK',
    //         FilterExpression: 'contains(#PN, :PN)',
    //         ExpressionAttributeNames: {
    //             '#PK': 'PK',
    //             '#PN': 'PN',
    //         },
    //         ExpressionAttributeValues: {
    //             ':PK': `Phase`,

    //         },
    //     });
    // }

    // async fetchUsersMastByPhaseDetail(phaseDetail: string): Promise<UserMast[]> {
    //     return this.query({
    //         TableName: this.tableName,
    //         KeyConditionExpression: '#PK = :PK',
    //         ExpressionAttributeNames: {
    //             '#PK': 'PK',
    //         },
    //         ExpressionAttributeValues: {
    //             ':PK': `Phase#${phaseDetail}`,
    //         },
    //     });
    // }

    // ================================================
    // keys
    // ================================================
    protected getPK(_input: UserMast): string {
        return `User`;
    }
    protected getSK(input: UserMast): string {
        return `${input.createdAt}#${input.userID}`;
    }
    protected getUUID(input: UserMast): string {
        return `${input.userID}`;
    }
}
