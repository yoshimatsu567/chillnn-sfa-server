import { repositoryContainer } from '@/repository';
import { Handler } from 'aws-lambda';
import { Scalars } from 'chillnn-sfa-abr/src/entities/type';

type UserAction =
    // user
    | 'UpdateUserMast'
    // client
    | 'AddClient'
    | 'UpdateClient'
    // phase
    | 'AddPhase'
    | 'UpdatePhase'
    // event
    | 'AddEvent'
    | 'UpdateEvent';

export const handler: Handler = async (
    //
    event: {
        input: any;
        action: UserAction;
        userID: Scalars['ID'];
    },
) => {
    let response: any = null;
    try {
        switch (event.action) {
            // ==================================================
            // User
            // ==================================================
            case 'UpdateUserMast':
                response = await repositoryContainer.userMastRepository.updateUserMast(event.input);
                break;
            // ==================================================
            // Client
            // ==================================================
            case 'AddClient':
                response = await repositoryContainer.clientMastRepository.addClient(event.input);
                break;
            case 'UpdateClient':
                response = await repositoryContainer.clientMastRepository.updateClient(event.input);
                break;
            // ==================================================
            // Phase
            // ==================================================
            case 'AddPhase':
                response = await repositoryContainer.phaseMastRepository.addPhase(event.input);
                break;
            case 'UpdatePhase':
                response = await repositoryContainer.phaseMastRepository.updatePhase(event.input);
                break;
            // ==================================================
            // Event
            // ==================================================
            case 'AddEvent':
                response = await repositoryContainer.eventMastRepository.addEvent(event.input);
            case 'UpdateEvent':
                response = await repositoryContainer.eventMastRepository.updateEvent(event.input);
        }
    } catch (err) {
        console.error(err);
        throw new Error();
    }
    return response;
};
