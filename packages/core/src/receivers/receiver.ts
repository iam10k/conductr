import { APIInteraction } from 'discord-api-types/v10';

/**
 * The Receiver interface for Conductr to use.
 */
export class Receiver {
  constructor() {}

  isGeneric(): this is ReceiverGeneric {
    return true;
  }
}

/**
 * An interface to validate a generic Receiver.
 */
export interface ReceiverGeneric {
  handleInteraction(handler: InteractionHandler): void;
}

/**
 * The handler for pushing interaction events to {@link Conductr}.
 * @throws {Error} If the interaction is not handled.
 * @private
 */
export type InteractionHandler = (interaction: APIInteraction) => Promise<void>;
