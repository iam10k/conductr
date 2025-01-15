import {
  APIMessageButtonInteractionData,
  APIMessageChannelSelectInteractionData,
  APIMessageMentionableSelectInteractionData,
  APIMessageRoleSelectInteractionData,
  APIMessageStringSelectInteractionData,
  APIMessageUserSelectInteractionData,
  ComponentType
} from '@discordjs/core';
import { MessageComponentCreator } from './message-component-creator';

/**
 * Create a button component handler.
 */
export class ButtonComponentCreator extends MessageComponentCreator<ComponentType.Button, APIMessageButtonInteractionData> {
  public constructor() {
    super(ComponentType.Button);
  }
}

/**
 * Create a select menu component handler.
 */
export class SelectMenuComponentCreator extends MessageComponentCreator<ComponentType.StringSelect, APIMessageStringSelectInteractionData> {
  public constructor() {
    super(ComponentType.StringSelect);
  }
}

/**
 * Create a user select menu component handler.
 */
export class UserSelectMenuComponentCreator extends MessageComponentCreator<ComponentType.UserSelect, APIMessageUserSelectInteractionData> {
  public constructor() {
    super(ComponentType.UserSelect);
  }
}

/**
 * Create a role select menu component handler.
 */
export class RoleSelectMenuComponentCreator extends MessageComponentCreator<ComponentType.RoleSelect, APIMessageRoleSelectInteractionData> {
  public constructor() {
    super(ComponentType.RoleSelect);
  }
}

/**
 * Create a mentionable select menu component handler.
 */
export class MentionableSelectMenuComponentCreator extends MessageComponentCreator<
  ComponentType.MentionableSelect,
  APIMessageMentionableSelectInteractionData
> {
  public constructor() {
    super(ComponentType.MentionableSelect);
  }
}

/**
 * Create a channel select menu component handler.
 */
export class ChannelSelectMenuComponentCreator extends MessageComponentCreator<
  ComponentType.ChannelSelect,
  APIMessageChannelSelectInteractionData
> {
  public constructor() {
    super(ComponentType.ChannelSelect);
  }
}
