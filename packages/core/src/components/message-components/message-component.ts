import { APIMessageComponentInteraction, ComponentType, Snowflake } from '@discordjs/core';
import { Mixin } from 'ts-mixer';
import { CustomId, Guilds } from '../../mixins';
import { Component } from '../component';
import { MessageComponentHandler } from './message-component-handler';

/**
 * @private
 */
export class MessageComponent<IType extends APIMessageComponentInteraction = APIMessageComponentInteraction>
  extends Mixin(Guilds, CustomId)
  implements Component<MessageComponentHandler<IType>>
{
  constructor(
    private readonly _componentType: ComponentType,
    private readonly _handler: MessageComponentHandler<IType>,
    customId: string | RegExp,
    guilds: Snowflake[]
  ) {
    super();
    Reflect.set(this, '_customId', customId);
    Reflect.set(this, '_componentTypePrefix', this._componentType);
    Reflect.set(this, '_guilds', guilds);
  }

  get componentType(): ComponentType {
    return this._componentType;
  }

  getHandler(): MessageComponentHandler<IType> {
    return this._handler;
  }

  equals(other: Component): boolean {
    return this.customIdKey === other.customIdKey;
  }

  isMessageComponent(): this is MessageComponent<IType> {
    return true;
  }

  isModal(): this is any {
    return false;
  }
}
