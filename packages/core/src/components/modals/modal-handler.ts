import { APIModalSubmitInteraction } from 'discord-api-types/v10';
import { ModalSubmitResolvers } from '../../interactions';

export type ModalHandler = (interaction: APIModalSubmitInteraction, resolved: ModalSubmitResolvers) => Promise<void> | void;
