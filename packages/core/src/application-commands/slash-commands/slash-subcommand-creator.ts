import {
  ApplicationCommandOptionBase,
  SharedNameAndDescription,
  SharedSlashCommandOptions,
  SlashCommandAssertions,
  SlashCommandSubcommandBuilder,
  ToAPIApplicationCommandOptions
} from '@discordjs/builders';
import { SlashCommandAutocompleteHandler, SlashCommandHandler, SlashHandlers } from './slash-handler';
import { Mixin } from 'ts-mixer';
import {
  ApplicationCommandOptionType,
  type APIApplicationCommandSubcommandGroupOption,
  type APIApplicationCommandSubcommandOption
} from 'discord-api-types/v10';

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
  /**
   * The name of this subcommand.
   */
  public readonly name: string = undefined;

  /**
   * The description of this subcommand.
   */
  public readonly description: string = undefined;

  /**
   * The options within this subcommand.
   */
  public readonly options: ApplicationCommandOptionBase[] = [];

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

  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  public toJSON(): APIApplicationCommandSubcommandOption {
    SlashCommandAssertions.validateRequiredParameters(this.name, this.description, this.options);

    return {
      type: ApplicationCommandOptionType.Subcommand,
      name: this.name,
      name_localizations: this.name_localizations,
      description: this.description,
      description_localizations: this.description_localizations,
      options: this.options.map(option => option.toJSON())
    };
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
export class SlashSubcommandGroupCreator
  extends Mixin(SharedNameAndDescription, SharedSlashCommandOptions<SlashCommandSubcommandCreatorInterface>)
  implements ToAPIApplicationCommandOptions
{
  /**
   * The name of this subcommand group.
   */
  public readonly name: string = undefined;

  /**
   * The description of this subcommand group.
   */
  public readonly description: string = undefined;

  /**
   * The subcommands within this subcommand group.
   */
  public readonly options: SlashCommandSubcommandBuilder[] = [];

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

    SlashCommandAssertions.assertReturnOfBuilder(result, SlashSubcommandCreator);

    // Push it
    options.push(result);

    // Add the handler
    handlers.set(result.name, { slash: result.interactionHandler, autocomplete: result.autocompleteHandler });

    return this;
  }

  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  public toJSON(): APIApplicationCommandSubcommandGroupOption {
    SlashCommandAssertions.validateRequiredParameters(this.name, this.description, this.options);

    return {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: this.name,
      name_localizations: this.name_localizations,
      description: this.description,
      description_localizations: this.description_localizations,
      options: this.options.map(option => option.toJSON())
    };
  }
}
