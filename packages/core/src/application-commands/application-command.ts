import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, Snowflake } from '@discordjs/core';
import { ContextMenu } from './context-menus';
import { SlashCommand } from './slash-commands';

export interface ApplicationCommand<JSONData extends RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody> {
  guilds: Snowflake[] | undefined;

  name: string;

  type: ApplicationCommandType;

  commandKey: string;

  isSlashCommand(): this is SlashCommand;

  isContextMenuCommand(): this is ContextMenu;

  toJSON(): JSONData;
}
