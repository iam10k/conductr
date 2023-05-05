import { ContextMenuCommandBuilder, ContextMenuCommandType } from '@discordjs/builders';
import { APIContextMenuInteraction } from 'discord-api-types/v10';
import { mix } from 'ts-mixer';
import { ContextMenuResolvers } from '../../interactions';
import { ForGuilds } from '../../mixins';
import { ContextMenuHandler } from './context-menu-handler';
import { MessageContextMenuCreator, UserContextMenuCreator } from './context-menu-types';
import { ContextMenu } from './context-menu';

export interface ContextMenuCreator<IType extends APIContextMenuInteraction, Resolved extends ContextMenuResolvers>
  extends ContextMenuCommandBuilder,
    ForGuilds {}

/**
 * Creator for Context Menus
 * Prefer using specific creators like {@link UserContextMenuCreator} or {@link MessageContextMenuCreator} for type safety.
 */
@mix(ForGuilds)
export class ContextMenuCreator<
  IType extends APIContextMenuInteraction,
  Resolved extends ContextMenuResolvers
> extends ContextMenuCommandBuilder {
  /**
   * Handler for the context menu
   * @private
   */
  private handler: ContextMenuHandler<IType, Resolved> = null;

  constructor(type: ContextMenuCommandType) {
    super();
    this.setType(type);
  }

  /**
   * Sets the handler called when the context menu is used.
   * @param handler
   */
  handleContextMenu(handler: ContextMenuHandler<IType, Resolved>): this {
    this.handler = handler;
    return this;
  }

  /**
   * Creates the final {@link ContextMenu} instance.
   */
  create(): ContextMenu {
    if (!this.handler) {
      throw new Error('Cannot create a context menu without a handleContextMenu() set');
    }
    return new ContextMenu(this.toJSON(), this.handler, this.guilds);
  }
}
