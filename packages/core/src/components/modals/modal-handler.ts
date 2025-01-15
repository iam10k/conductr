import { APIModalSubmitInteraction } from '@discordjs/core';
import { ModalSubmitResolvers } from '../../interactions';

export type ModalHandler = (interaction: APIModalSubmitInteraction, resolved: ModalSubmitResolvers) => Promise<void> | void;
