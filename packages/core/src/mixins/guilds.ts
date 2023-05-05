import { Snowflake } from 'discord-api-types/v10';

/**
 * This mixin adds the ability to set the guilds where this command is available
 */
export class ForGuilds {
  protected readonly guilds: Snowflake[] = [];

  /**
   * Sets the guilds where this command is available
   * @param guildIdOrGuildIds list of guilds or a single guildId
   */
  forGuilds(guildIdOrGuildIds: Snowflake | Snowflake[]): this {
    if (Array.isArray(guildIdOrGuildIds)) {
      this.guilds.push(...guildIdOrGuildIds);
    } else {
      this.guilds.push(guildIdOrGuildIds);
    }

    return this;
  }
}

/**
 * This mixin is used to add the guilds property to the class
 */
export class Guilds {
  private readonly _guilds: Snowflake[];

  get guilds(): Snowflake[] | undefined {
    return this._guilds.length === 0 ? undefined : this._guilds;
  }
}
