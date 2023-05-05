import { InteractionHandler, Receiver, ReceiverGeneric } from './receiver';

/**
 * A receiver that can be used to handle interactions without a webserver.
 */
export class GenericReceiver extends Receiver implements ReceiverGeneric {
  private readonly _eventHandler: GenericHandler;

  constructor(eventHandler: GenericHandler) {
    super();
    this._eventHandler = eventHandler;
  }

  handleInteraction(handler: InteractionHandler): void {
    this._eventHandler(handler);
  }
}

type GenericHandler = (handler: InteractionHandler) => void;
