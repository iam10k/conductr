import { SlashCommandAssertions, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';
import { SlashCommandAutocompleteHandler, SlashCommandHandler, SlashHandlers } from './slash-handler';

/**
 * This extension is used to add the handleInteraction and handleAutocompleteInteraction methods to the SlashCommandSubcommandBuilder class.
 * {@link SlashCommandSubcommandBuilder}
 */
export class SlashSubcommandCreator extends SlashCommandSubcommandBuilder {
  readonly interactionHandler: SlashCommandHandler = null;
  readonly autocompleteHandler: SlashCommandAutocompleteHandler = null;

  constructor() {
    super();
  }

  handleInteraction(handler: SlashCommandHandler): this {
    Reflect.set(this, 'interactionHandler', handler);
    return this;
  }

  handleAutocompleteInteraction(handler: SlashCommandAutocompleteHandler): this {
    Reflect.set(this, 'autocompleteHandler', handler);
    return this;
  }
}

/**
 * This extension is used to add modify the addSubcommand method to the SlashCommandSubcommandGroupBuilder class.
 * {@link SlashCommandSubcommandGroupBuilder}
 */
export class SlashSubcommandGroupCreator extends SlashCommandSubcommandGroupBuilder {
  readonly handlers: Map<string, SlashHandlers> = new Map();

  constructor() {
    super();
  }

  addSubcommand(input: SlashSubcommandCreator | ((subcommandGroup: SlashSubcommandCreator) => SlashSubcommandCreator)): this {
    const { options, handlers } = this;

    // First, assert options conditions - we cannot have more than 25 options
    SlashCommandAssertions.validateMaxOptionsLength(options);

    // Get the final result
    const result = typeof input === 'function' ? input(new SlashSubcommandCreator()) : input;

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashSubcommandCreator);

    // Push it
    options.push(result);

    // Add the handler
    handlers.set(result.name, { slash: result.interactionHandler, autocomplete: result.autocompleteHandler });

    return this;
  }
}
