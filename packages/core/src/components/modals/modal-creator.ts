import { Mixin } from 'ts-mixer';
import { ForGuilds, SetCustomId } from '../../mixins';
import { ModalHandler } from './modal-handler';
import { Modal } from './modal';

/**
 * Creator for handling modal submissions
 */
export class ModalCreator extends Mixin(ForGuilds, SetCustomId) {
  /**
   * Handler for the modal
   * @private
   */
  private handler: ModalHandler;

  constructor() {
    super();
  }

  /**
   * Sets the handler called when the message component is used.
   * @param handler
   */
  handleInteraction(handler: ModalHandler): this {
    this.handler = handler;
    return this;
  }

  /**
   * Creates the final {@link Modal} instance.
   */
  create(): Modal {
    if (!this.handler) {
      throw new Error('Cannot create modal without using handleInteraction()');
    }
    if (!this.customId) {
      throw new Error('Cannot create modal without using setCustomId()');
    }
    return new Modal(this.customId, this.handler, this.guilds);
  }
}
