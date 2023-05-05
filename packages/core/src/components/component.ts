import { Snowflake } from 'discord-api-types/v10';
import { MessageComponent } from './message-components';
import { Modal } from './modals';

export interface Component<Handler extends Function = Function> {
  guilds: Snowflake[] | undefined;

  componentTypePrefix: string | number;

  customId: string | RegExp;

  customIdKey: string;

  isCustomIdRegex(): this is this & { customId: RegExp };

  isCustomIdExact(): this is this & { customId: string };

  getHandler(): Handler;

  equals(other: Component<Handler>): boolean;

  customIdMatches(customId: string): boolean;

  isModal(): this is Modal;

  isMessageComponent(): this is MessageComponent;
}
