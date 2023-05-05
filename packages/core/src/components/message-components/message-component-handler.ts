import { APIMessageComponentInteraction } from 'discord-api-types/v10';

export type MessageComponentHandler<IType extends APIMessageComponentInteraction = APIMessageComponentInteraction> = (
  interaction: IType
) => Promise<void> | void;
