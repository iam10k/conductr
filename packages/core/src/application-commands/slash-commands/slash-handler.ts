import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandOptionChoice,
  APIChatInputApplicationCommandInteraction
} from '@discordjs/core';
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
