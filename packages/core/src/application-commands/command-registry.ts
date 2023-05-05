import {
  APIApplicationCommand,
  APIApplicationCommandAutocompleteInteraction,
  APIChatInputApplicationCommandInteraction,
  APIContextMenuInteraction,
  ApplicationCommandType,
  Routes,
  Snowflake
} from 'discord-api-types/v10';
import { Conductr } from '../conductr';
import { AutocompleteInteraction, ContextMenuInteraction, SlashInteraction } from '../interactions';
import { getCommandNames } from '../util';
import { ApplicationCommand } from './application-command';
import { SlashCommand, SlashHandlers } from './slash-commands';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/rest/v10/interactions';
import equal from 'deep-equal';
import { REST } from '@discordjs/rest';

export interface SyncOptions {
  applicationId: Snowflake;
  skipGlobal?: boolean;
  skipDelete?: boolean;
  skipGuilds?: Snowflake[] | boolean;
  skipGuildErrors?: boolean;
}

export class CommandRegistry {
  /**
   * Global commands
   */
  private readonly commands: Map<string, ApplicationCommand> = new Map();
  /**
   * Guild commands
   */
  private readonly guildCommands: Map<string, Map<string, ApplicationCommand>> = new Map();

  constructor(private readonly conductr: Conductr, private readonly rest?: REST) {}

  registerCommand(applicationCommand: ApplicationCommand): void {
    if (applicationCommand.guilds) {
      for (const guildId of applicationCommand.guilds) {
        let existingGuildMap = this.guildCommands.get(guildId);

        if (existingGuildMap) {
          if (existingGuildMap.has(applicationCommand.commandKey)) {
            throw new Error(`A command with the name "${applicationCommand.commandKey}" is already registered in guildId ${guildId}`);
          }
        } else {
          existingGuildMap = new Map();
          this.guildCommands.set(guildId, existingGuildMap);
        }

        existingGuildMap.set(applicationCommand.commandKey, applicationCommand);
      }
    } else {
      if (this.commands.has(applicationCommand.commandKey)) {
        throw new Error(`A global command with the name "${applicationCommand.commandKey}" is already registered.`);
      }

      this.commands.set(applicationCommand.commandKey, applicationCommand);
    }

    this.conductr.emit('commandRegistered', applicationCommand);
    this.conductr.emit(
      'debug',
      `Registered command ${applicationCommand.commandKey} ${
        applicationCommand.guilds ? 'in ' + applicationCommand.guilds.join(',') : 'globally'
      }.`
    );
  }

  getCommand(type: ApplicationCommandType, name: string, guildId?: Snowflake): ApplicationCommand | null {
    const commandKey = `${type}:${name}`;
    if (guildId) {
      const guildCommandMap = this.guildCommands.get(guildId);
      if (guildCommandMap && guildCommandMap.has(commandKey)) {
        return guildCommandMap.get(commandKey);
      }
    }

    if (this.commands.has(commandKey)) {
      return this.commands.get(commandKey);
    }
    return null;
  }

  async syncCommandsAsync(opts: SyncOptions): Promise<void> {
    const options = {
      skipDelete: false,
      skipGuilds: false,
      skipGuildErrors: false,
      ...opts
    };

    if (!this.rest) {
      throw new Error('Cannot sync commands without a rest client.');
    }

    if (!options.skipGlobal) {
      await this.syncGlobalCommands(options);
    }

    if (!options.skipGuilds) {
      for (const [guildId] of this.guildCommands.keys()) {
        if (Array.isArray(options.skipGuilds) && options.skipGuilds.includes(guildId)) {
          continue;
        }
        try {
          await this.syncGuildCommands(guildId, options);
        } catch (e) {
          if (options.skipGuildErrors) {
            this.conductr.emit('warn', `An error occurred during guild sync (${guildId}): ${(e as Error).message}`);
          } else {
            throw e;
          }
        }
      }
    }

    this.conductr.emit('debug', 'Finished syncing commands');
  }

  private async syncGlobalCommands(options: Pick<SyncOptions, 'applicationId' | 'skipDelete'>): Promise<void> {
    await this.syncCommandsIn([...this.commands.values()], options);
  }

  private async syncGuildCommands(guildId: Snowflake, options: Pick<SyncOptions, 'applicationId' | 'skipDelete'>): Promise<void> {
    if (!this.guildCommands.has(guildId)) {
      return;
    }

    const commands = [...this.guildCommands.get(guildId).values()];
    await this.syncCommandsIn(commands, { ...options, guildId });
  }

  private async syncCommandsIn(
    commands: ApplicationCommand[],
    options: Pick<SyncOptions, 'applicationId' | 'skipDelete'> & { guildId?: Snowflake }
  ): Promise<void> {
    const debugMessage = options.guildId ? `guild ${options.guildId}` : 'global';
    const applicationCommands: APIApplicationCommand[] = (await this.rest.get(
      options.guildId
        ? Routes.applicationGuildCommands(options.applicationId, options.guildId)
        : Routes.applicationCommands(options.applicationId),
      {
        query: new URLSearchParams({ with_localizations: 'true' })
      }
    )) as APIApplicationCommand[];

    const updatePayload: (RESTPostAPIApplicationCommandsJSONBody & { id?: Snowflake })[] = [];
    const registeredKeys = new Set<string>();

    for (const existing of applicationCommands) {
      const command = this.getCommand(existing.type, existing.name, options.guildId);
      if (command) {
        this.conductr.emit('debug', `Existing command ${existing.name} (type ${existing.type}, id ${existing.id}) in ${debugMessage}`);
        updatePayload.push({ id: existing.id, ...command.toJSON() });
      } else if (!options.skipDelete) {
        this.conductr.emit('debug', `Deleting command ${existing.name} (type ${existing.type}, id ${existing.id}) in ${debugMessage}`);
      } else {
        this.conductr.emit('debug', `Unhandled command ${existing.name} (type ${existing.type}, id ${existing.id}) in ${debugMessage}`);
        updatePayload.push({ ...existing });
      }

      // Track the keys we've seen, we can compare against the registered commands later
      registeredKeys.add(`${existing.type}:${existing.name}`);

      // Remove these keys from the payload to use for comparison
      delete existing.application_id;
      delete existing.version;
    }

    for (const command of commands) {
      // Skip commands that are already registered
      if (registeredKeys.has(command.commandKey)) {
        continue;
      }

      this.conductr.emit('debug', `Creating command ${command.name} (type ${command.type}) in ${debugMessage}`);
      updatePayload.push(command.toJSON());
    }

    if (!equal(updatePayload, applicationCommands, { strict: true })) {
      await this.rest.put(Routes.applicationCommands(options.applicationId), { body: updatePayload });
      this.conductr.emit('debug', `Updated ${debugMessage} commands`);
    } else {
      this.conductr.emit('debug', `No changes to ${debugMessage} commands`);
    }
  }

  private commandAndHandler(interaction: APIChatInputApplicationCommandInteraction | APIApplicationCommandAutocompleteInteraction): {
    command: SlashCommand | null;
    handlers: SlashHandlers | null;
  } {
    const [name, group, subcommand] = getCommandNames(interaction);
    const slashCommand = this.getCommand(ApplicationCommandType.ChatInput, name, interaction.guild_id);
    if (!slashCommand || !slashCommand.isSlashCommand()) {
      this.conductr.emit('warn', `No command found for interaction ${interaction.id}`);
      return { command: null, handlers: null };
    }

    return { command: slashCommand, handlers: slashCommand.getHandlers(group, subcommand) };
  }

  async processCommand(interaction: APIChatInputApplicationCommandInteraction): Promise<void> {
    this.conductr.emit('debug', 'Received command interaction');

    const { command, handlers } = this.commandAndHandler(interaction);
    if (!command) {
      this.conductr.emit('warn', `No command found for interaction ${interaction.id}`);
      throw new Error('No command found for interaction');
    }
    if (!handlers?.slash) {
      this.conductr.emit('warn', `No slash handler found for interaction ${interaction.id}`);
      throw new Error('No slash handler found for interaction');
    }

    this.conductr.emit('commandInteraction', interaction, command);

    return handlers.slash(interaction, new SlashInteraction(interaction));
  }

  async processCommandAutocomplete(interaction: APIApplicationCommandAutocompleteInteraction): Promise<void> {
    this.conductr.emit('debug', 'Received autocomplete interaction');

    const { command, handlers } = this.commandAndHandler(interaction);
    if (!command) {
      this.conductr.emit('warn', `No command found for interaction ${interaction.id}`);
      throw new Error('No autocomplete found for interaction');
    }
    if (!handlers?.autocomplete) {
      this.conductr.emit('warn', `No autocomplete handler found for interaction ${interaction.id}`);
      throw new Error('No autocomplete handler found for interaction');
    }

    this.conductr.emit('commandAutocompleteInteraction', interaction, command);

    handlers.autocomplete(interaction, new AutocompleteInteraction(interaction));
  }

  async processContextMenu(interaction: APIContextMenuInteraction): Promise<void> {
    if (interaction.data.type === ApplicationCommandType.User) {
      this.conductr.emit('debug', 'Received user command interaction');
    } else if (interaction.data.type === ApplicationCommandType.Message) {
      this.conductr.emit('debug', 'Received message command interaction');
    }

    const contextMenuCommand = this.getCommand(interaction.data.type, interaction.data.name, interaction.guild_id);
    if (!contextMenuCommand || !contextMenuCommand.isContextMenuCommand()) {
      this.conductr.emit('warn', `No context menu found for interaction ${interaction.id}`);
      throw new Error('No context menu found for interaction');
    }

    const handler = contextMenuCommand.getHandler();
    if (!handler) {
      this.conductr.emit('warn', `No context menu handler found for interaction ${interaction.id}`);
      throw new Error('No context menu handler found for interaction');
    }

    this.conductr.emit('contextMenuInteraction', interaction, contextMenuCommand);

    return handler(interaction, new ContextMenuInteraction(interaction));
  }
}
