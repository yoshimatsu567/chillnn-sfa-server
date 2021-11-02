import { CustomMessageSignUpTriggerEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { RepositoryContainer } from 'chillnn-sfa-abr';

const cognito = new AWS.CognitoIdentityServiceProvider({});

//今回はCognitoのGUIからのみ、新規登録をしようと考えているので恐らく使わない
export class UserCognitoService {
    constructor(
        private repositoryContainer: RepositoryContainer, //
    ) {}

    public async registerService(input: CustomMessageSignUpTriggerEvent) {
        const userID = input.userName;
        const email = input.request.userAttributes.email;
        const now = new Date().getTime();

        try {
            await this.repositoryContainer.userMastRepository.addUserMast({
                userID,
                email,
                name: '',
                userStatus: '',
                createdAt: now,
                updatedAt: now,
            });
        } catch (err) {
            console.error(err);
            await cognito
                .adminDeleteUser({
                    UserPoolId: input.userPoolId,
                    Username: userID,
                })
                .promise();
            throw new Error('ユーザーがすでに存在しています');
        }

        const codeParameter: string = input.request.codeParameter || '{####}';
        input.response.emailSubject = `【新規登録】ようこそCHILLNN SFAへ`;
        input.response.emailMessage = `あなたの認証コード = ${codeParameter}`;
        return input;
    }
}
