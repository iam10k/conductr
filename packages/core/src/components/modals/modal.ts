import { Snowflake } from 'discord-api-types/v10';
import { Mixin } from 'ts-mixer';
import { CustomId, Guilds } from '../../mixins';
import { Component } from '../component';
import { ModalHandler } from './modal-handler';

/**
 * @private
 */
export class Modal extends Mixin(Guilds, CustomId) implements Component<ModalHandler> {
  constructor(customId: string | RegExp, private readonly _handler: ModalHandler, guilds: Snowflake[] | undefined) {
    super();
    Reflect.set(this, '_customId', customId);
    Reflect.set(this, '_componentType', 'M');
    Reflect.set(this, '_guilds', guilds);
  }

  getHandler(): ModalHandler {
    return this._handler;
  }

  isModal(): this is Modal {
    return true;
  }

  isMessageComponent(): this is any {
    return false;
  }

  equals(other: Component<ModalHandler>): boolean {
    return this.customIdKey === other.customIdKey;
  }
}
