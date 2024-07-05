import {
  SharedNameAndDescription,
  SharedSlashCommand,
  SharedSlashCommandOptions,
  SlashCommandAssertions,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder
} from '@discordjs/builders';
import { ForGuilds } from '../../mixins';
import { SlashCommandAutocompleteHandler, SlashCommandHandler, SlashHandlers } from './slash-handler';
import {
  SlashCommandSubcommandCreatorInterface,
  SlashSubcommandCreator,
  SlashSubcommandGroupCreator,
  SlashSubcommandGroupCreatorInterface
} from './slash-subcommand-creator';
import { SlashCommand } from './slash-command';
import { Mixin } from 'ts-mixer';

interface SharedSlashCommandCreator {
  handleInteraction(handler: SlashCommandHandler): SlashCommandOptionsOnlyBuilder;

  handleAutocompleteInteraction(handler: SlashCommandAutocompleteHandler): SlashCommandOptionsOnlyBuilder;

  addSubcommand(
    input:
      | SlashCommandSubcommandCreatorInterface
      | ((subcommandGroup: SlashCommandSubcommandCreatorInterface) => SlashCommandSubcommandCreatorInterface)
  ): SlashCommandSubcommandsOnlyCreator;

  addSubcommandGroup(
    input:
      | SlashSubcommandGroupCreatorInterface
      | ((subcommandGroup: SlashSubcommandGroupCreatorInterface) => SlashSubcommandGroupCreatorInterface)
  ): SlashCommandSubcommandsOnlyCreator;

  create(): SlashCommand;
}

/**
 * An interface specifically for slash command subcommands.
 */
export interface SlashCommandSubcommandsOnlyCreator
  extends SharedNameAndDescription,
    SharedSlashCommand,
    Omit<SharedSlashCommandCreator, 'handleInteraction' | 'handleAutocompleteInteraction'>,
    ForGuilds {}

/**
 * An interface specifically for slash command options.
 */
export interface SlashCommandOptionsOnlyBuilder
  extends SharedNameAndDescription,
    SharedSlashCommand,
    Omit<SharedSlashCommandCreator, 'addSubcommand' | 'addSubcommandGroup'>,
    ForGuilds,
    SharedSlashCommandOptions<SlashCommandOptionsOnlyBuilder> {}

/**
 * Creator for Slash Commands
 */
export class SlashCommandCreator
  extends Mixin(SharedNameAndDescription, SharedSlashCommandOptions<SlashCommandOptionsOnlyBuilder>, SharedSlashCommand, ForGuilds)
  implements ForGuilds
{
  /**
   * Map of groups to subcommands and HandlerFunctions or just subcommands to HandlerFunctions
   * @private
   */
  private readonly subHandlers: Map<string, SlashHandlers | Map<string, SlashHandlers>> = new Map();
  /**
   * Handlers for the root command
   * @private
   */
  private readonly handlers: SlashHandlers = { slash: null, autocomplete: null };

  constructor() {
    super();
  }

  /**
   * Sets the handler called when the command is used.
   * @param handler
   */
  handleInteraction(handler: SlashCommandHandler): SlashCommandOptionsOnlyBuilder {
    if (this.subHandlers.size > 0) {
      throw new Error('Cannot use handleInteraction() when using subcommands or subcommand groups');
    }
    if (this.handlers.slash) {
      throw new Error('Cannot use handleInteraction() more than once');
    }
    this.handlers.slash = handler;
    return this;
  }

  /**
   * Sets the handler called when the command autocomplete is requested.
   * @param handler
   */
  handleAutocompleteInteraction(handler: SlashCommandAutocompleteHandler): SlashCommandOptionsOnlyBuilder {
    if (this.subHandlers.size > 0) {
      throw new Error('Cannot use handleAutocompleteInteraction() when using subcommands or subcommand groups');
    }
    if (this.handlers.autocomplete) {
      throw new Error('Cannot use handleAutocompleteInteraction() more than once');
    }
    this.handlers.autocomplete = handler;
    return this;
  }

  /**
   * @see {@link SlashCommandBuilder#addSubcommand}
   */
  addSubcommand(
    input:
      | SlashCommandSubcommandCreatorInterface
      | ((subcommand: SlashCommandSubcommandCreatorInterface) => SlashCommandSubcommandCreatorInterface)
  ): SlashCommandSubcommandsOnlyCreator {
    if (this.handlers.autocomplete || this.handlers.slash) {
      throw new Error('Cannot use addSubcommand() when using root-level command options');
    }

    // First, assert options conditions - we cannot have more than 25 options
    SlashCommandAssertions.validateMaxOptionsLength(this.options);

    // Get the final result
    const result = typeof input === 'function' ? input(new SlashSubcommandCreator()) : input;

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);

    // Push it
    this.options.push(result);

    // Add the handler
    this.subHandlers.set(result.name, { slash: result.interactionHandler, autocomplete: result.autocompleteHandler });

    return this as unknown as SlashCommandSubcommandsOnlyCreator;
  }

  /**
   * @see {@link SlashCommandBuilder#addSubcommandGroup}
   */
  addSubcommandGroup(
    input: SlashSubcommandGroupCreator | ((subcommandGroup: SlashSubcommandGroupCreator) => SlashSubcommandGroupCreator)
  ): SlashCommandSubcommandsOnlyCreator {
    if (this.handlers.autocomplete || this.handlers.slash) {
      throw new Error('Cannot use addSubcommandGroup() when using root-level command options');
    }

    // First, assert options conditions - we cannot have more than 25 options
    SlashCommandAssertions.validateMaxOptionsLength(this.options);

    // Get the final result
    const result = typeof input === 'function' ? input(new SlashSubcommandGroupCreator()) : input;

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashCommandSubcommandGroupBuilder);

    // Push it
    this.options.push(result);

    // Add the handler
    this.subHandlers.set(result.name, result.handlers);

    return this as unknown as SlashCommandSubcommandsOnlyCreator;
  }

  /**
   * Creates the final {@link SlashCommand} instance.
   */
  create(): SlashCommand {
    if (this.subHandlers.size === 0 && !(this.handlers && this.handlers.slash)) {
      throw new Error('Cannot create a slash command without a handleInteraction() set');
    }
    return new SlashCommand(this.toJSON(), this.subHandlers.size > 0 ? this.subHandlers : this.handlers, this.guilds);
  }
}
