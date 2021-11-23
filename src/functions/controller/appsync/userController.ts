import { repositoryContainer } from '@/repository';
import { Handler } from 'aws-lambda';
import { Scalars } from 'chillnn-sfa-abr/src/entities/type';

type UserAction =
        // user
        | 'UpdateUserMast'
        | 'DeleteUserMast'
        // client
        | 'AddClient'
        | 'UpdateClient'
        | 'DeleteClient'
        // phase
        | 'AddPhase'
        | 'UpdatePhase'
        | 'DeletePhase'
        // event
        | 'AddEvent'
        | 'UpdateEvent'
        | 'DeleteEvent';

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
                        case 'DeleteUserMast':
                                response = await repositoryContainer.userMastRepository.deleteUserMast(event.input);
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
                        case 'DeleteClient':
                                console.log('hoge');
                                console.log(event);
                                response = await repositoryContainer.clientMastRepository.deleteClient(event.input.clientID);
                                console.log(response);
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
                        case 'DeletePhase':
                                response = await repositoryContainer.phaseMastRepository.deletePhase(event.input);
                                break;
                        // ==================================================
                        // Event
                        // ==================================================
                        case 'AddEvent':
                                response = await repositoryContainer.eventMastRepository.addEvent(event.input);
                                break;
                        case 'UpdateEvent':
                                response = await repositoryContainer.eventMastRepository.updateEvent(event.input);
                                break;
                        case 'DeleteEvent':
                                response = await repositoryContainer.eventMastRepository.deleteEvent(event.input);
                                break;
                }
        } catch (err) {
                console.error(err);
                throw new Error();
        }
        return response;
};
