import { APIContextMenuInteraction } from '@discordjs/core';
import { ContextMenuResolvers } from '../../interactions';

export type ContextMenuHandler<
  IType extends APIContextMenuInteraction = APIContextMenuInteraction,
  Resolved extends ContextMenuResolvers = ContextMenuResolvers
> = (interaction: IType, resolved: Resolved) => Promise<void> | void;
