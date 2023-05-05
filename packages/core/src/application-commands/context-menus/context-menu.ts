import { ApplicationCommandType, RESTPostAPIContextMenuApplicationCommandsJSONBody, Snowflake } from 'discord-api-types/v10';
import { Mixin } from 'ts-mixer';
import { Guilds } from '../../mixins';
import { ApplicationCommand } from '../application-command';
import { ContextMenuHandler } from './context-menu-handler';

/**
 * @private
 */
export class ContextMenu extends Mixin(Guilds) implements ApplicationCommand<RESTPostAPIContextMenuApplicationCommandsJSONBody> {
  constructor(
    private readonly _json: RESTPostAPIContextMenuApplicationCommandsJSONBody,
    private readonly _handler: ContextMenuHandler,
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
    return `${this._json.type}:${this.name}`;
  }

  getHandler(): ContextMenuHandler {
    return this._handler;
  }

  isContextMenuCommand(): this is ContextMenu {
    return true;
  }

  isSlashCommand(): this is any {
    return false;
  }

  toJSON(): RESTPostAPIContextMenuApplicationCommandsJSONBody {
    return this._json;
  }
}
