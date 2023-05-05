import {
  APIMessageApplicationCommandInteraction,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType
} from 'discord-api-types/v10';
import { MessageContextMenuResolvers, UserContextMenuResolvers } from '../../interactions';
import { ContextMenuCreator } from './context-menu-creator';

/**
 * Creator for User Context Menus
 */
export class UserContextMenuCreator extends ContextMenuCreator<APIUserApplicationCommandInteraction, UserContextMenuResolvers> {
  constructor() {
    super(ApplicationCommandType.User);
  }

  override setType(type: ApplicationCommandType): this {
    if (type !== ApplicationCommandType.User) {
      throw new Error('Cannot set a user context menu to a different type');
    }
    return super.setType(type);
  }
}

/**
 * Creator for Message Context Menus
 */
export class MessageContextMenuCreator extends ContextMenuCreator<APIMessageApplicationCommandInteraction, MessageContextMenuResolvers> {
  constructor() {
    super(ApplicationCommandType.Message);
  }

  override setType(type: ApplicationCommandType): this {
    if (type !== ApplicationCommandType.Message) {
      throw new Error('Cannot set a message context menu to a different type');
    }
    return super.setType(type);
  }
}
