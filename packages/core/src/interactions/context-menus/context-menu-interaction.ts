import {
  APIContextMenuInteraction,
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIMessageApplicationCommandInteraction,
  APIUser,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType
} from 'discord-api-types/v10';

export interface ContextMenuResolvers {
  getTargetId(): string;
}

export interface MessageContextMenuResolvers extends ContextMenuResolvers {
  getTargetMessage(): APIMessage | null;
}

export interface UserContextMenuResolvers extends ContextMenuResolvers {
  getTargetUser(): APIUser | null;

  getTargetGuildMember(): APIInteractionDataResolvedGuildMember | null;
}

export class ContextMenuInteraction<T extends APIContextMenuInteraction = APIContextMenuInteraction>
  implements MessageContextMenuResolvers, UserContextMenuResolvers
{
  constructor(private readonly interaction: T) {}

  getTargetId(): string {
    return this.interaction.data.target_id;
  }

  getTargetGuildMember(): APIInteractionDataResolvedGuildMember | null {
    if (!this.isTargetUser()) {
      return null;
    }
    return this.interaction.data.resolved?.members?.[this.getTargetId()] ?? null;
  }

  getTargetMessage(): APIMessage | null {
    if (!this.isTargetMessage()) {
      return null;
    }
    return this.interaction.data.resolved?.messages?.[this.getTargetId()] ?? null;
  }

  getTargetUser(): APIUser | null {
    if (!this.isTargetUser()) {
      return null;
    }
    return this.interaction.data.resolved?.users?.[this.getTargetId()] ?? null;
  }

  isTargetMessage(): this is ContextMenuInteraction<APIMessageApplicationCommandInteraction> {
    return this.interaction.data.type === ApplicationCommandType.Message;
  }

  isTargetUser(): this is ContextMenuInteraction<APIUserApplicationCommandInteraction> {
    return this.interaction.data.type === ApplicationCommandType.User;
  }
}
