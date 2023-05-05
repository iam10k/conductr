import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandOptionChoice,
  APIChatInputApplicationCommandInteraction
} from 'discord-api-types/v10';
import { AutocompleteInteraction, SlashInteraction } from '../../interactions';

export type SlashCommandHandler = (
  interaction: APIChatInputApplicationCommandInteraction,
  resolved: SlashInteraction
) => Promise<void> | void;

export type SlashCommandAutocompleteHandler = (
  interaction: APIApplicationCommandAutocompleteInteraction,
  resolved: AutocompleteInteraction
) => Promise<APIApplicationCommandOptionChoice[] | undefined> | APIApplicationCommandOptionChoice[] | undefined;

export type SlashHandlers = { slash: SlashCommandHandler; autocomplete: SlashCommandAutocompleteHandler };
