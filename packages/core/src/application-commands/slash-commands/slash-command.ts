import { ApplicationCommandType, RESTPostAPIChatInputApplicationCommandsJSONBody, Snowflake } from 'discord-api-types/v10';
import { mix, Mixin } from 'ts-mixer';
import { Guilds } from '../../mixins';
import { ApplicationCommand } from '../application-command';
import { SlashHandlers } from './slash-handler';

/**
 * @private
 */
@mix(Guilds)
export class SlashCommand extends Mixin(Guilds) implements ApplicationCommand<RESTPostAPIChatInputApplicationCommandsJSONBody> {
  constructor(
    private readonly _json: RESTPostAPIChatInputApplicationCommandsJSONBody,
    private readonly _handlers: SlashHandlers | Map<string, SlashHandlers | Map<string, SlashHandlers>>,
    guilds: Snowflake[]
  ) {
    super();
    Reflect.set(this, '_guilds', guilds);
  }

  get name(): string {
    return this._json.name;
  }

  get type(): ApplicationCommandType {
    return this._json.type;
  }

  get commandKey(): string {
    return `${ApplicationCommandType.ChatInput}:${this.name}`;
  }

  getHandlers(levelOne?: string, levelTwo?: string): SlashHandlers | null {
    // If there are no subcommands, just return the handlers
    if (!(this._handlers instanceof Map)) {
      // Prevent handling unknown subcommands if there are no subcommands or groups
      if (levelOne) {
        return null;
      }
      return this._handlers; // root command
    }

    // If there are subcommands or groups require a level one name to be specified
    if (!levelOne) {
      return null;
    }

    const subHandler = this._handlers.get(levelOne);
    if (!subHandler) {
      return null;
    }

    // If there are no groups, just return the subcommand handlers
    if (!(subHandler instanceof Map)) {
      // Prevent handling unknown subcommands if level one is not a group
      if (levelTwo) {
        return null;
      }

      return subHandler; // subcommand
    }

    return subHandler.get(levelTwo) ?? null; // group subcommand
  }

  isContextMenuCommand(): this is any {
    return false;
  }

  isSlashCommand(): this is SlashCommand {
    return true;
  }

  toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return this._json;
  }
}
