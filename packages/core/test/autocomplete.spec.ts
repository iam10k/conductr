import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  Routes
} from '@discordjs/core';
import type { REST } from '@discordjs/rest';
import { CommandRegistry } from '../src/application-commands/command-registry';
import { SlashCommandCreator } from '../src/application-commands/slash-commands';
import type { Conductr } from '../src/conductr';

function buildInteraction(focusedValue = 'fo'): APIApplicationCommandAutocompleteInteraction {
  return {
    id: '123',
    token: 'interaction-token',
    type: InteractionType.ApplicationCommandAutocomplete,
    data: {
      id: '456',
      name: 'search',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'query',
          type: ApplicationCommandOptionType.String,
          value: focusedValue,
          focused: true
        }
      ]
    }
  } as unknown as APIApplicationCommandAutocompleteInteraction;
}

function buildRegistry(autocompleteResult: APIApplicationCommandOptionChoice[] | undefined) {
  const conductr = { emit: jest.fn() } as unknown as Conductr;
  const rest = { post: jest.fn().mockResolvedValue(undefined) } as unknown as REST;

  const registry = new CommandRegistry(conductr, rest);

  const command = new SlashCommandCreator()
    .setName('search')
    .setDescription('Search for things')
    .addStringOption(option => option.setName('query').setDescription('The query').setAutocomplete(true))
    .handleInteraction(() => {})
    .handleAutocompleteInteraction(() => autocompleteResult)
    .create();

  registry.registerCommand(command);

  return { registry, rest, conductr };
}

describe('CommandRegistry#processCommandAutocomplete', () => {
  it('sends the returned choices back to Discord (regression for dropped autocomplete results)', async () => {
    const choices: APIApplicationCommandOptionChoice[] = [
      { name: 'Foo', value: 'foo' },
      { name: 'Food', value: 'food' }
    ];
    const { registry, rest } = buildRegistry(choices);

    await registry.processCommandAutocomplete(buildInteraction());

    expect(rest.post).toHaveBeenCalledTimes(1);
    expect(rest.post).toHaveBeenCalledWith(Routes.interactionCallback('123', 'interaction-token'), {
      body: {
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: { choices }
      },
      auth: false
    });
  });

  it('sends an empty choices list when the handler returns no results', async () => {
    const { registry, rest } = buildRegistry([]);

    await registry.processCommandAutocomplete(buildInteraction());

    expect(rest.post).toHaveBeenCalledTimes(1);
    expect(rest.post).toHaveBeenCalledWith(Routes.interactionCallback('123', 'interaction-token'), {
      body: {
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: { choices: [] }
      },
      auth: false
    });
  });

  it('does not respond when the handler opts out by returning undefined', async () => {
    const { registry, rest } = buildRegistry(undefined);

    await registry.processCommandAutocomplete(buildInteraction());

    expect(rest.post).not.toHaveBeenCalled();
  });
});
