import { APIModalSubmitInteraction } from 'discord-api-types/v10';

export type ModalHandler = (interaction: APIModalSubmitInteraction) => Promise<void> | void;
