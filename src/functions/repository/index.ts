import { RepositoryContainer } from 'chillnn-sfa-abr';
import { clientMastRepository } from './modules/clientMastRepository';
import { eventMastRepository } from './modules/eventMastRepository';
import { phaseMastRepository } from './modules/phaseMastRepository';
import { userMastRepository } from './modules/userMastRepository';

export const repositoryContainer = new RepositoryContainer(
    // resources
    userMastRepository,
    clientMastRepository,
    eventMastRepository,
    phaseMastRepository,
);
