import { APIMessageComponentInteraction, APIModalSubmitInteraction, ComponentType, Snowflake } from 'discord-api-types/v10';
import { Conductr } from '../conductr';
import { Component } from './component';
import { ModalSubmitInteraction } from '../interactions';

interface ComponentMap {
  /**
   * Exact customId stored as `${componentType}${customId}`
   * */
  exact: Map<string, Component>;
  /**
   * Regex matchers
   */
  regex: Component[];
}

const emptyComponentMap = (): ComponentMap => ({
  exact: new Map(),
  regex: []
});

export class ComponentRegistry {
  /**
   * Global exact components
   */
  private readonly components: ComponentMap = emptyComponentMap();
  /**
   * Guild regex components
   */
  private readonly guildComponents: Map<string, ComponentMap> = new Map();

  constructor(private readonly conductr: Conductr) {}

  registerComponent(component: Component): void {
    function checkForDuplicates(map: ComponentMap): boolean {
      return (
        (component.isCustomIdRegex() && map.regex.some(other => component.equals(other))) ||
        (component.isCustomIdExact() && map.exact.has(component.customIdKey))
      );
    }

    function addComponentToMap(map: ComponentMap) {
      if (component.isCustomIdRegex()) {
        map.regex.push(component);
      } else if (component.isCustomIdExact()) {
        map.exact.set(component.customIdKey, component);
      }
    }

    if (component.guilds) {
      for (const guildId of component.guilds) {
        let guildCompMap = this.guildComponents.get(guildId);

        if (guildCompMap) {
          if (checkForDuplicates(guildCompMap)) {
            throw new Error(
              `A component with customId "${component.customId}" (type ${component.componentTypePrefix}) is already registered in guildId ${guildId}`
            );
          }
        } else {
          guildCompMap = emptyComponentMap();
          this.guildComponents.set(guildId, guildCompMap);
        }

        addComponentToMap(guildCompMap);
      }
    } else {
      if (checkForDuplicates(this.components)) {
        throw new Error(
          `A global component with the customId "${component.customId}" (type ${component.componentTypePrefix}) is already registered.`
        );
      }

      addComponentToMap(this.components);
    }

    this.conductr.emit('componentRegistered', component);
    this.conductr.emit(
      'debug',
      `Registered component ${component.customId} (type ${component.componentTypePrefix}) ${
        component.guilds ? 'in ' + component.guilds.join(',') : 'globally'
      }`
    );
  }

  getComponent(componentType: ComponentType | 'M', customId: string, guildId?: Snowflake): Component | null {
    const componentKey = `${componentType}:${customId}`;

    function getComponentFromMap(map: ComponentMap): Component | null {
      if (map.exact.has(componentKey)) {
        return map.exact.get(componentKey);
      }

      return map.regex.find(c => c.customIdMatches(customId) && (!c.isMessageComponent() || c.componentType === componentType)) ?? null;
    }

    if (guildId) {
      const guildComponentMap = this.guildComponents.get(guildId);
      if (guildComponentMap) {
        const componentForGuild = getComponentFromMap(guildComponentMap);
        if (componentForGuild) {
          return componentForGuild;
        }
      }
    }

    return getComponentFromMap(this.components) ?? null;
  }

  async processModal(interaction: APIModalSubmitInteraction): Promise<void> {
    this.conductr.emit('debug', 'Received modal submit interaction');

    const component = this.getComponent('M', interaction.data.custom_id, interaction.guild_id);
    if (!component) {
      this.conductr.emit('debug', 'No component found for interaction');
      throw new Error('No modal found for interaction');
    }

    if (!component.getHandler() || !component.isModal()) {
      this.conductr.emit('debug', 'No handler found for component');
      throw new Error('No handler found for modal');
    }

    this.conductr.emit('modalInteraction', interaction, component);

    const handler = component.getHandler();
    return handler(interaction, new ModalSubmitInteraction(interaction));
  }

  async processMessageComponent(interaction: APIMessageComponentInteraction): Promise<void> {
    this.conductr.emit('debug', 'Received message component interaction');

    const component = this.getComponent(interaction.data.component_type, interaction.data.custom_id, interaction.guild_id);
    if (!component) {
      this.conductr.emit('debug', 'No component found for interaction');
      throw new Error('No component found for interaction');
    }

    if (!component.getHandler() || !component.isMessageComponent()) {
      this.conductr.emit('debug', 'No handler found for component');
      throw new Error('No handler found for component');
    }

    this.conductr.emit('componentInteraction', interaction, component);

    const handler = component.getHandler();
    return handler(interaction);
  }
}
