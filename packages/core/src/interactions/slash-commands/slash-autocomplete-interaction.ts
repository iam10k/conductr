import { APIApplicationCommandAutocompleteInteraction, APIApplicationCommandInteractionDataBasicOption } from '@discordjs/core';
import { OptionsResolvers, SlashInteraction } from './slash-interaction';

export interface AutocompleteOptionsResolvers {
  getFocused(getFull: boolean): APIApplicationCommandInteractionDataBasicOption | string | number | boolean;
}

export class AutocompleteInteraction extends SlashInteraction implements OptionsResolvers, AutocompleteOptionsResolvers {
  constructor(interaction: APIApplicationCommandAutocompleteInteraction) {
    super(interaction);
  }

  /**
   * Gets the focused option.
   * @param {boolean} [getFull=true] Whether to get the full option object
   * @returns {string|APIApplicationCommandInteractionDataBasicOption}
   * The value of the option, or the whole option if getFull is true
   */
  getFocused(getFull: true): APIApplicationCommandInteractionDataBasicOption;
  getFocused(getFull?: false): string | number | boolean;
  getFocused(getFull = true): APIApplicationCommandInteractionDataBasicOption | string | number | boolean {
    const focusedOption = this.hoistedOptions.find(
      (option: APIApplicationCommandInteractionDataBasicOption & { focused?: boolean }) => option.focused
    );
    if (!focusedOption) {
      throw new Error('AutocompleteInteraction no focused option');
    }
    return getFull ? focusedOption : focusedOption.value;
  }
}
