import { initializeDraggableCombatTracker } from './combat-tracker-draggable.js';

export class ICRPGCombatTracker extends CombatTracker {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/combat/combat-tracker.html',
    });
  }

  constructor(options) {
    super(options);
    this.isIdCollapsed = new Map();
  }

  async getData() {
    const content = await super.getData();
    const combatants = this.viewed?.combatants ?? [];
    content.trackDamage = game.settings.get('icrpgme', 'trackDamage');
    content.showMonsterHP = game.settings.get('icrpgme', 'showMonsterHP');
    content.turns = this._enrichTurns(content.turns);

    // Split turns into player combatants (also includes NPCS) and GM combatants
    content.playerTurns = [];
    content.gmTurns = [];
    content.obstacles = [];
    content.vehicles = [];
    content.hardSuits = [];

    const vehicleIds = combatants.filter((c) => c.actor.type === 'vehicle').map((c) => c.id);
    const obstaclesIds = combatants.filter((c) => c.actor.type === 'obstacle').map((c) => c.id);
    const hardSuitsIds = combatants.filter((c) => c.actor.type === 'hardSuit').map((c) => c.id);

    content.turns.forEach((t) => {
      if (vehicleIds.includes(t.id)) return content.vehicles.push(t);
      if (obstaclesIds.includes(t.id)) return content.obstacles.push(t);
      if (hardSuitsIds.includes(t.id)) return content.hardSuits.push(t);

      const init = parseInt(t.initiative);
      if (init < 40) content.gmTurns.push(t);
      else content.playerTurns.push(t);
    });
    return content;
  }

  _enrichTurns(turns) {
    const combatants = this.viewed?.combatants;
    if (!combatants) return turns;

    return turns.map((turn) => {
      const combatant = combatants.get(turn.id);
      const actor = combatant.actor;
      turn.health = actor?.system?.health;
      turn.type = actor.type;

      // Handle vehicle
      if (actor?.type === 'vehicle') {
        turn.chunks = actor.system.chunks;
      }

      // Set collapsed state
      if (!this.isIdCollapsed.has(combatant.id)) this.isIdCollapsed.set(combatant.id, true);
      turn.collapsed = this.isIdCollapsed.get(combatant.id);

      // Resources
      turn.showResources = turn.owner && ['character', 'monster'].includes(turn.type);
      if (turn.showResources) {
        turn.mastery = actor.system.mastery;
        turn.sp = actor.system.sp;
        turn.resources = actor.system.resources;
      }

      // Handle hard suit
      if (turn.type === 'hardSuit') {
        turn.parts = actor.items.filter((i) => i.type === 'part').sort((a, b) => a.name.localeCompare(b.name));
        turn.power = actor.system.power.value;
      }
      return turn;
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Health input
    html.find('.hp-field input').on('click', (ev) => {
      // Avoid propagation (so that canvas doesn't pan) and select all the text inside
      ev.stopImmediatePropagation();
      ev.currentTarget.select();
    });
    html.find('.hp-field input').on('keyup', (ev) => {
      // Sanitize non-numerical values (and not + -)
      ev.currentTarget.value = ev.currentTarget.value.replace(/[^+\-0-9]/gm, '');
      ev.currentTarget.value = ev.currentTarget.value.replace(/(?!^)[+-]/gm, '');
    });
    html.find('.hp-field input').on('change', (ev) => {
      // Grab data from html
      const ct = $(ev.currentTarget);
      const newValue = String(ct.val());
      const target = ct.closest('[data-target]').data('target');
      const combatantId = ct.closest('[data-combatant-id]').data('combatantId');
      const chunkIndex = ct.closest('[data-chunk-index]').data('chunkIndex');

      // Get actor and old (hp) value
      const actor = this.viewed?.combatants.get(combatantId).actor;
      const oldValue = getProperty(actor, target);
      let finalValue;

      // If newvalue has length 0, reset it in the html to the old
      if (newValue.length === 0) ct.val(oldValue);
      // If newvalue includes a + or -, update additive
      else if (newValue.includes('+') || newValue.includes('-')) finalValue = oldValue + parseInt(newValue);
      // Otherwise, do a normal update
      else finalValue = parseInt(newValue);
      if (finalValue == null) return;

      // If we have a chunk index, then it's a vehicle. So use the actor's method for editing chunk HP
      if (chunkIndex != null) actor.setChunkHealth(chunkIndex, { [target]: finalValue });
      // Otherwise, standard actor update
      else actor.update({ [target]: finalValue });
    });

    // Resource input
    html.find('.resource-field input').on('change', (ev) => {
      // Grab data from html
      const ct = $(ev.currentTarget);
      let newValue = parseInt(ct.val());
      let target = ct.closest('[data-target]').data('target');
      const combatantId = ct.closest('[data-combatant-id]').data('combatantId');
      const actor = this.viewed?.combatants.get(combatantId).actor;

      // If mastery, simple update
      if (target.includes('mastery')) {
        return actor.update({ [target]: Math.clamped(0, newValue, 20) });
      }

      // If SP
      if (target.includes('sp')) {
        const resource = getProperty(actor, target);
        target += `.value`;
        return actor.update({ [target]: Math.clamped(newValue, 0, resource.max) });
      }

      // If power
      if (target.includes('power')) {
        return actor.update({ [target]: Math.clamped(0, newValue, 100) });
      }

      // If generic
      const resources = actor.system.resources;
      const index = ct.closest('[data-resource-index]').data('resourceIndex');
      resources[index].value = Math.clamped(newValue, 0, resources[index].max);
      actor.update({ 'system.resources': resources }, { updateResourceIndex: index });
    });

    // Hearts HP progress bar (everything but chunks)
    html.find('.hearts-container').each((_, hc) => {
      const cid = $(hc).closest('[data-combatant-id]').data('combatantId');
      const c = this.viewed?.combatants.get(cid);
      let dmg = c.actor.system.health.damage;
      let maxHpOffset = (10 - c.actor.system.health.max) % 10; // The damage offset. 10 -> 0; 5 -> 5.

      // If chunk, use the chunk dmg instead of the global
      const chunkIndex = $(hc).closest('[data-chunk-index]').data('chunkIndex');
      if (chunkIndex != null) {
        const chunk = c.actor.system.chunks[chunkIndex];
        dmg = chunk.health.damage;
        maxHpOffset = chunk.health.max % 10;
      }
      dmg += maxHpOffset; // Sum the offset to the damage, ensuring that the displayed heart maximum is 10

      $($(hc).find('[data-heart-index] .bar-effect').get().reverse()).each((_, el) => {
        const w = 16 * (Math.clamped(dmg, 0, 10) / 10);
        dmg -= 10;
        el.style.width = Math.ceil(w) + 'px';
      });
    });

    // Resources progress bar
    html.find('.resource-bar-container').each((_, barContainer) => {
      barContainer = $(barContainer);
      const bar = barContainer.find('.resource-bar');
      const target = barContainer.closest('[data-target]').data('target');
      const combatantId = barContainer.closest('[data-combatant-id]').data('combatantId');
      const actor = this.viewed?.combatants.get(combatantId).actor;

      let resource = getProperty(actor, target);
      if (!resource) return;
      let percentage;
      if (target.includes('mastery')) percentage = (resource / 20) * 100;
      else if (target.includes('sp') || target.includes('health')) percentage = (resource.value / resource.max) * 100;
      else if (target.includes('power')) percentage = resource;
      else {
        const index = barContainer.closest('[data-resource-index]').data('resourceIndex');
        resource = actor.system.resources[index];
        percentage = (resource.value / resource.max) * 100;
      }
      percentage += `%`;

      bar.css('width', percentage);
    });

    // Toolbar buttons
    html.find('[data-control="shuffle"]').click(() => this.viewed?.shuffleCombatants());

    // Collapse buttons
    html.find('.collapse-toggle').click((ev) => {
      ev.stopImmediatePropagation();
      const ct = $(ev.currentTarget);
      const li = ct.closest('li[data-combatant-id]');
      const id = li.data('combatantId');
      const isCurrentlyCollapsed = this.isIdCollapsed.get(id) ?? true;
      this.isIdCollapsed.set(id, !isCurrentlyCollapsed);
      const collapsable = li.find('.collapsable');
      const icon = ct.find('i');
      if (isCurrentlyCollapsed) {
        collapsable.slideDown(200);
        icon.removeClass('fa-chevron-down');
        icon.addClass('fa-chevron-up');
      } else {
        collapsable.slideUp(200);
        icon.removeClass('fa-chevron-up');
        icon.addClass('fa-chevron-down');
      }
    });

    // Item discrete selector
    html.find('[data-item-id] .icrpg-discrete-selector').click((ev) => {
      ev.stopPropagation();
      const index = $(ev.currentTarget).closest('[data-index]').data('index');
      const target = $(ev.currentTarget).closest('[data-target]').data('target');
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const combatantId = $(ev.currentTarget).closest('li[data-combatant-id]').data('combatantId');
      const actor = this.viewed?.combatants.get(combatantId).actor;
      const item = actor?.items.get(itemId);
      if (!item) return;

      let value = index + 1;
      if (getProperty(item, target) === value) value -= 1;
      item.update({ [target]: value });
    });
  }

  _getEntryContextOptions() {
    return [
      {
        name: 'COMBAT.CombatantUpdate',
        icon: '<i class="fas fa-edit"></i>',
        callback: this._onConfigureCombatant.bind(this),
      },
      {
        name: 'COMBAT.PingCombatant',
        icon: '<i class="fa-solid fa-bullseye-arrow"></i>',
        callback: (li) => {
          const c = this.viewed?.combatants.get(li.data('combatant-id'));
          if (c) return this._onPingCombatant(c);
        },
      },
      {
        name: 'COMBAT.ToggleVis',
        icon: '<i class="fas fa-eye-slash"></i>',
        callback: (li) => {
          const c = this.viewed?.combatants.get(li.data('combatant-id'));
          if (c) return c.update({ hidden: !c.hidden });
        },
      },
      {
        name: 'COMBAT.ToggleDead',
        icon: '<i class="fas fa-skull"></i>',
        callback: (li) => {
          const c = this.viewed.combatants.get(li.data('combatant-id'));
          if (c) return this._onToggleDefeatedStatus(c);
        },
      },
      {
        name: 'COMBAT.CombatantRemove',
        icon: '<i class="fas fa-trash"></i>',
        callback: (li) => {
          const c = this.viewed?.combatants.get(li.data('combatant-id'));
          if (c) return c.delete();
        },
      },
    ];
  }
}

initializeDraggableCombatTracker();
Hooks.on('updateActor', async (actor, changes, _options, _userID) => {
  game.combats.apps.forEach((a) => a.render());
  if (!game.user.isGM) return;

  if (actor.type === 'obstacle' && changes.name != null) {
    game.combats.forEach((combat) => {
      combat.combatants.filter((c) => c.actor.uuid === actor.uuid).forEach((c) => c.update({ name: changes.name }));
    });
  }
});
