import {
  APIApplicationCommandAutocompleteInteraction,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType
} from 'discord-api-types/v10';

export function getCommandNames(
  interaction: APIChatInputApplicationCommandInteraction | APIApplicationCommandAutocompleteInteraction
): [string, string?, string?] {
  const names: [string] = [interaction.data.name];
  if (interaction.data.options?.length > 0) {
    if (interaction.data.options[0].type === ApplicationCommandOptionType.Subcommand) {
      names.push(interaction.data.options[0].name);
    } else if (interaction.data.options[0].type === ApplicationCommandOptionType.SubcommandGroup) {
      names.push(interaction.data.options[0].name);
      names.push(interaction.data.options[0].options[0].name);
    }
  }
  return names;
}
