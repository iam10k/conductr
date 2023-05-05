import {
  APIBaseInteraction,
  APIMessageComponentBaseInteractionData,
  APIMessageComponentInteraction,
  ComponentType,
  InteractionType
} from 'discord-api-types/v10';
import { Mixin } from 'ts-mixer';
import { ForGuilds, SetCustomId } from '../../mixins';
import { MessageComponentHandler } from './message-component-handler';
import { MessageComponent } from './message-component';

/**
 * Creator for handling message components
 * Prefer using specific creators like {@link ButtonComponentCreator} or {@link SelectMenuComponentCreator} for type safety.
 */
export class MessageComponentCreator<CType extends ComponentType, Data extends APIMessageComponentBaseInteractionData<CType>> extends Mixin(
  ForGuilds,
  SetCustomId
) {
  /**
   * Handler for the message component
   * @private
   */
  private handler: MessageComponentHandler<APIBaseInteraction<InteractionType.MessageComponent, Data> & APIMessageComponentInteraction>;

  constructor(private readonly type: CType) {
    super();
  }

  /**
   * Sets the handler called when the message component is used.
   * @param handler
   */
  handleInteraction(
    handler: MessageComponentHandler<APIBaseInteraction<InteractionType.MessageComponent, Data> & APIMessageComponentInteraction>
  ): this {
    this.handler = handler;
    return this;
  }

  /**
   * Creates the final {@link MessageComponent} instance.
   */
  create(): MessageComponent {
    if (!this.handler) {
      throw new Error('Cannot create message component without using handleInteraction()');
    }
    if (!this.customId) {
      throw new Error('Cannot create message component without using setCustomId()');
    }
    return new MessageComponent(this.type, this.handler, this.customId, this.guilds);
  }
}
