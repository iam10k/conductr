import { APIMessageComponentInteraction } from '@discordjs/core';

export type MessageComponentHandler<IType extends APIMessageComponentInteraction = APIMessageComponentInteraction> = (
  interaction: IType
) => Promise<void> | void;
