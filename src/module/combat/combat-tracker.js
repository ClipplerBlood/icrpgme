import { initializeDraggableCombatTracker } from './combat-tracker-draggable.js';

export class ICRPGCombatTracker extends CombatTracker {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/combat/combat-tracker.html',
    });
  }

  async getData() {
    const content = await super.getData();
    content.trackDamage = game.settings.get('icrpgme', 'trackDamage');
    content.showMonsterHP = game.settings.get('icrpgme', 'showMonsterHP');
    content.turns = this._enrichTurns(content.turns);

    // Split turns into player combatants (also includes NPCS) and GM combatants
    content.playerTurns = [];
    content.gmTurns = [];
    content.obstacles = [];
    content.vehicles = [];

    const vehicleIds = this.viewed.combatants.filter((c) => c.actor.type === 'vehicle').map((c) => c.id);
    const obstaclesIds = this.viewed.combatants.filter((c) => c.actor.type === 'obstacle').map((c) => c.id);

    content.turns.forEach((t) => {
      if (vehicleIds.includes(t.id)) return content.vehicles.push(t);
      if (obstaclesIds.includes(t.id)) return content.obstacles.push(t);

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
      if (actor?.type === 'vehicle') {
        turn.chunks = actor.system.chunks;
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
      const actor = this.viewed.combatants.get(combatantId).actor;
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

    // Hearts HP progress bar (everything but chunks)
    html.find('.hearts-container').each((_, hc) => {
      const cid = $(hc).closest('[data-combatant-id]').data('combatantId');
      const c = this.viewed.combatants.get(cid);
      let dmg = c.actor.system.health.damage;
      let maxHpOffset = c.actor.system.health.max % 10; // The damage offset. 10 -> 0; 5 -> 5.

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

    // Toolbar buttons
    html.find('[data-control="shuffle"]').click(() => this.viewed.shuffleCombatants());
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
          const c = this.viewed.combatants.get(li.data('combatant-id'));
          if (c) return this._onPingCombatant(c);
        },
      },
      {
        name: 'COMBAT.ToggleVis',
        icon: '<i class="fas fa-eye-slash"></i>',
        callback: (li) => {
          const c = this.viewed.combatants.get(li.data('combatant-id'));
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
          const c = this.viewed.combatants.get(li.data('combatant-id'));
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
