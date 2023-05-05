import { SharedSlashCommandOptions, SlashCommandAssertions, SlashCommandBuilder } from '@discordjs/builders';
import { mix } from 'ts-mixer';
import { ForGuilds } from '../../mixins';
import { SlashCommandAutocompleteHandler, SlashCommandHandler, SlashHandlers } from './slash-handler';
import { SlashSubcommandCreator, SlashSubcommandGroupCreator } from './slash-subcommand-creator';
import { SlashCommand } from './slash-command';

interface SlashCommandSubcommandsOnlyCreator
  extends Omit<
    SlashCommandCreator,
    Exclude<keyof SharedSlashCommandOptions, 'options'> | 'handleInteraction' | 'handleAutocompleteInteraction'
  > {}

interface SlashCommandOnlyCreator extends Omit<SlashCommandCreator, 'addSubcommand' | 'addSubcommandGroup'> {}

export interface SlashCommandCreator extends SlashCommandBuilder, ForGuilds {}

/**
 * Creator for Slash Commands
 */
@mix(ForGuilds)
export class SlashCommandCreator extends SlashCommandBuilder {
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
  handleInteraction(handler: SlashCommandHandler): SlashCommandOnlyCreator {
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
  handleAutocompleteInteraction(handler: SlashCommandAutocompleteHandler): SlashCommandOnlyCreator {
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
    input: SlashSubcommandCreator | ((subcommandGroup: SlashSubcommandCreator) => SlashSubcommandCreator)
  ): SlashCommandSubcommandsOnlyCreator {
    if (this.handlers.autocomplete || this.handlers.slash) {
      throw new Error('Cannot use addSubcommand() when using root-level command options');
    }

    // First, assert options conditions - we cannot have more than 25 options
    SlashCommandAssertions.validateMaxOptionsLength(this.options);

    // Get the final result
    const result = typeof input === 'function' ? input(new SlashSubcommandCreator()) : input;

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashSubcommandCreator);

    // Push it
    this.options.push(result);

    // Add the handler
    this.subHandlers.set(result.name, { slash: result.interactionHandler, autocomplete: result.autocompleteHandler });

    return this;
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

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashSubcommandGroupCreator);

    // Push it
    this.options.push(result);

    // Add the handler
    this.subHandlers.set(result.name, result.handlers);

    return this;
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
