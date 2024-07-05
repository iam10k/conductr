import {
  SharedNameAndDescription,
  SharedSlashCommandOptions,
  SlashCommandAssertions,
  SlashCommandSubcommandBuilder
} from '@discordjs/builders';
import { SlashCommandAutocompleteHandler, SlashCommandHandler, SlashHandlers } from './slash-handler';
import { Mixin } from 'ts-mixer';

export interface SharedSlashCommandSubcommandCreator {
  readonly interactionHandler: SlashCommandHandler | null;
  readonly autocompleteHandler: SlashCommandAutocompleteHandler | null;

  handleInteraction(handler: SlashCommandHandler): this;

  handleAutocompleteInteraction(handler: SlashCommandAutocompleteHandler): this;
}

export interface SlashCommandSubcommandCreatorInterface
  extends SharedNameAndDescription,
    SharedSlashCommandSubcommandCreator,
    SharedSlashCommandOptions<SlashCommandSubcommandCreatorInterface> {}

/**
 * This extension is used to add the handleInteraction and handleAutocompleteInteraction methods to the SlashCommandSubcommandBuilder class.
 * {@link SlashCommandSubcommandBuilder}
 */
export class SlashSubcommandCreator
  extends Mixin(SlashCommandSubcommandBuilder, SharedSlashCommandOptions<SlashCommandSubcommandCreatorInterface>)
  implements SharedSlashCommandSubcommandCreator
{
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

interface SharedSlashSubcommandGroupCreator {
  readonly handlers: Map<string, SlashHandlers>;

  addSubcommand(
    input:
      | SlashCommandSubcommandCreatorInterface
      | ((subcommandGroup: SlashCommandSubcommandCreatorInterface) => SlashCommandSubcommandCreatorInterface)
  ): this;
}

export interface SlashSubcommandGroupCreatorInterface
  extends SharedNameAndDescription,
    SharedSlashSubcommandGroupCreator,
    SharedSlashCommandOptions<SlashSubcommandGroupCreatorInterface> {}

/**
 * This extension is used to add modify the addSubcommand method to the SlashCommandSubcommandGroupBuilder class.
 * {@link SlashCommandSubcommandGroupBuilder}
 */
export class SlashSubcommandGroupCreator extends Mixin(
  SharedNameAndDescription,
  SharedSlashCommandOptions<SlashCommandSubcommandCreatorInterface>
) {
  readonly handlers: Map<string, SlashHandlers> = new Map();

  constructor() {
    super();
  }

  addSubcommand(
    input:
      | SlashCommandSubcommandCreatorInterface
      | ((subcommandGroup: SlashCommandSubcommandCreatorInterface) => SlashCommandSubcommandCreatorInterface)
  ): this {
    const { options, handlers } = this;

    // First, assert options conditions - we cannot have more than 25 options
    SlashCommandAssertions.validateMaxOptionsLength(options);

    // Get the final result
    const result = typeof input === 'function' ? input(new SlashSubcommandCreator()) : input;

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);

    // Push it
    options.push(result);

    // Add the handler
    handlers.set(result.name, { slash: result.interactionHandler, autocomplete: result.autocompleteHandler });

    return this;
  }
}
