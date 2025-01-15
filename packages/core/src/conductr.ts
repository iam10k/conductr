import { REST } from '@discordjs/rest';
import {
  APIApplicationCommandAutocompleteInteraction,
  APIChatInputApplicationCommandInteraction,
  APIContextMenuInteraction,
  APIInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  ApplicationCommandType,
  InteractionType
} from '@discordjs/core';
import EventEmitter from 'eventemitter3';
import 'reflect-metadata';
import { ApplicationCommand, CommandRegistry, ContextMenu, SlashCommand, SyncOptions } from './application-commands';
import { Component, ComponentRegistry, MessageComponent, Modal } from './components';
import { Receiver } from './receivers';
import { TypedEventEmitter } from './util';

interface ConductrCallback {
  withReceiver(receiver: Receiver): this;
}

export class Conductr extends (EventEmitter as any as new () => TypedEventEmitter<ConductrEvents>) implements ConductrCallback {
  private readonly options: Omit<ConductrOptions, 'token' | 'rest'>;

  private readonly commandRegistry: CommandRegistry;
  private readonly componentRegistry: ComponentRegistry;

  private readonly rest?: REST;

  constructor(options: ConductrOptions) {
    super();
    this.options = options;
    this.rest = options.rest ?? (options.token ? new REST().setToken(options.token) : undefined);

    this.commandRegistry = new CommandRegistry(this, this.rest);
    this.componentRegistry = new ComponentRegistry(this);
  }

  /**
   * Registers a single Command or Component
   * @param commandOrComponent A Command or Component instance
   */
  registerCommandAndComponent(commandOrComponent: object): this {
    if (commandOrComponent instanceof SlashCommand || commandOrComponent instanceof ContextMenu) {
      this.commandRegistry.registerCommand(commandOrComponent);
    } else if (commandOrComponent instanceof Modal || commandOrComponent instanceof MessageComponent) {
      this.componentRegistry.registerComponent(commandOrComponent);
    }
    return this;
  }

  /**
   * Registers multiple Commands or Components
   * @param commandOrComponents An array of Command instances or constructors
   * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
   */
  registerCommandAndComponents(commandOrComponents: any[], ignoreInvalid = false): this {
    if (!Array.isArray(commandOrComponents)) throw new TypeError('commandOrComponents must be an Array.');
    for (const cOrC of commandOrComponents) {
      try {
        this.registerCommandAndComponent(cOrC);
      } catch (e) {
        if (ignoreInvalid) {
          this.emit('warn', `Skipped an invalid command or component: ${e}`);
        } else {
          throw e;
        }
      }
    }
    return this;
  }

  /**
   * Syncs the commands to Discord.
   */
  syncCommands(opts?: Omit<SyncOptions, 'applicationId'>): this {
    this.commandRegistry.syncCommandsAsync({
      applicationId: this.options.applicationId,
      ...opts
    });
    return this;
  }

  /**
   * Syncs the commands to Discord with a callback to start a receiver after commands have registered.
   */
  syncCommandsAsync(
    callback: (conductr: Pick<Conductr, keyof ConductrCallback>) => Promise<void> | void,
    opts?: Omit<SyncOptions, 'applicationId'>
  ): this {
    this.commandRegistry
      .syncCommandsAsync({
        applicationId: this.options.applicationId,
        ...opts
      })
      .then(() => callback(this));
    return this;
  }

  /**
   * Sets the implementation for receiving interactions
   */
  withReceiver(receiver: Receiver): this {
    if (!receiver.isGeneric()) {
      throw new Error('Only receivers that implement the generic interface are supported.');
    }
    receiver.handleInteraction(interaction => this.onInteraction(interaction));
    return this;
  }

  private async onInteraction(interaction: APIInteraction): Promise<void> {
    this.emit('rawInteraction', interaction);

    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        if (interaction.data.type === ApplicationCommandType.ChatInput) {
          return this.commandRegistry.processCommand(interaction as APIChatInputApplicationCommandInteraction);
        } else {
          return this.commandRegistry.processContextMenu(interaction as APIContextMenuInteraction);
        }
      case InteractionType.ApplicationCommandAutocomplete:
        return this.commandRegistry.processCommandAutocomplete(interaction as APIApplicationCommandAutocompleteInteraction);
      case InteractionType.MessageComponent:
        return this.componentRegistry.processMessageComponent(interaction as APIMessageComponentInteraction);
      case InteractionType.ModalSubmit:
        return this.componentRegistry.processModal(interaction as APIModalSubmitInteraction);
      default:
        this.emit('warn', `Received unknown interaction type ${interaction.type}`);
        throw new Error(`Received unknown interaction type ${interaction.type}`);
    }
  }
}

export interface ConductrOptions {
  /** Your Application ID */
  applicationId: string;
  /**
   * The public key for your application.
   * Required for webservers to validate requests.
   */
  publicKey?: string;
  /**
   * The bot token for the application.
   */
  token?: string;
  /**
   * Custom REST instance to use.
   */
  rest?: REST;
}

export interface ConductrEvents {
  synced: () => void;
  warn: (warning: Error | string) => void;
  debug: (message: string) => void;
  error: (err: Error) => void;
  rawInteraction: (interaction: APIInteraction) => void;
  commandInteraction: (interaction: APIChatInputApplicationCommandInteraction, command: SlashCommand) => void;
  commandAutocompleteInteraction: (interaction: APIApplicationCommandAutocompleteInteraction, command: SlashCommand) => void;
  contextMenuInteraction: (interaction: APIContextMenuInteraction, contextMenu: ContextMenu) => void;
  componentInteraction: (interaction: APIMessageComponentInteraction, component: MessageComponent) => void;
  modalInteraction: (interaction: APIModalSubmitInteraction, modal: Modal) => void;
  commandRegistered: (command: ApplicationCommand) => void;
  componentRegistered: (component: Component) => void;
}
