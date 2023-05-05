/**
 * This mixin adds the ability to set the custom id for a message component
 */
export class SetCustomId {
  protected customId: string | RegExp;

  /**
   * Sets the custom id for the message component
   * @param customId string or regex to match the custom id
   */
  setCustomId(customId: string | RegExp): this {
    this.customId = customId;
    return this;
  }
}

/**
 * This mixin is used to add the customId property to the class
 */
export class CustomId {
  private readonly _customId: string | RegExp;
  private readonly _componentTypePrefix: string | number;

  get customId(): string | RegExp {
    return this._customId;
  }

  get componentTypePrefix(): string | number {
    return this._componentTypePrefix;
  }

  get customIdKey(): string {
    return this._customId instanceof RegExp ? this._customId.source : `${this._componentTypePrefix}:${this._customId}`;
  }

  isCustomIdRegex(): this is this & { customId: RegExp } {
    return this._customId instanceof RegExp;
  }

  isCustomIdExact(): this is this & { customId: string } {
    return typeof this._customId === 'string';
  }

  customIdMatches(customId: string): boolean {
    return this.isCustomIdRegex() ? this.customId.test(customId) : this.customId === customId;
  }
}
