import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const singletonDocumentClient: DocumentClient = new DocumentClient({
    region: process.env.REGION!,
});

export abstract class DynamoDBRepositoryBase<ResourceObject> {
    public static readonly MASTER_TABLE_NAME = process.env.DYNAMODB_MASTER_TABLE_NAME!;
    public static readonly UUIDIndexName = process.env.DYNAMODB_MASTER_TABLE_UUID_INDEX_NAME!;

    constructor(
        protected tableName: string, //
    ) {}

    // ===================================================================
    //
    // partition key & primary key
    //
    // ===================================================================
    protected abstract getPK(input: ResourceObject): string;
    protected abstract getSK(input: ResourceObject): string;
    protected abstract getUUID(input: ResourceObject): string;
    protected getKey(input: ResourceObject) {
        return {
            PK: this.getPK(input),
            SK: this.getSK(input),
        };
    }
    // ===================================================================
    //
    // functions
    //
    // ===================================================================
    protected async putItem(params: DocumentClient.PutItemInput): Promise<ResourceObject> {
        // params.ReturnValues = 'ALL_NEW';
        await singletonDocumentClient.put(params).promise();
        return params.Item as ResourceObject;
    }

    protected async deleteItem(params: DocumentClient.DeleteItemInput): Promise<ResourceObject> {
        params.ReturnValues = 'ALL_OLD';
        const res = await singletonDocumentClient.delete(params).promise();
        return res.Attributes as ResourceObject;
    }

    protected async query(params: DocumentClient.QueryInput): Promise<ResourceObject[]> {
        const res = await singletonDocumentClient.query(params).promise();
        return res.Items as ResourceObject[];
    }

    protected async getItem(params: DocumentClient.GetItemInput): Promise<ResourceObject | null> {
        const res = await singletonDocumentClient.get(params).promise();
        return res.Item as ResourceObject | null;
    }
}
