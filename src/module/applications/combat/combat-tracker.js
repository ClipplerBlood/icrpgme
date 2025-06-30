import { initializeDraggableCombatTracker } from './combat-tracker-draggable.js';

const { CombatTracker } = foundry.applications.sidebar.tabs;

export class ICRPGCombatTracker extends CombatTracker {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/combat/combat-header.hbs',
    },
    tracker: {
      template: 'systems/icrpgme/templates/combat/combat-tracker.hbs',
    },
    footer: {
      template: 'templates/sidebar/tabs/combat/footer.hbs',
    },
  };

  static DEFAULT_OPTIONS = {
    actions: {
      addTarget: () => game.icrpgme.timerTargetContainer?.addTarget(),
      addTimer: () => game.icrpgme.timerTargetContainer?.addTimer(),
      shuffle: () => game.combat.shuffleCombatants(),
    },
  };

  constructor(options) {
    super(options);
    this.isIdCollapsed = new Map();
    this.ctrlHoverId = null;
  }

  async _prepareTrackerContext(context, options) {
    await super._prepareTrackerContext(context, options);
    const combatants = this.viewed?.combatants ?? [];
    context.trackDamage = game.settings.get('icrpgme', 'trackDamage');
    context.showMonsterHP = game.settings.get('icrpgme', 'showMonsterHP');
    context.turns = this._enrichTurns(context.turns ?? this.viewed?.turns ?? []);

    // Split turns into player combatants (also includes NPCS) and GM combatants
    context.playerTurns = [];
    context.gmTurns = [];
    context.obstacles = [];
    context.vehicles = [];
    context.hardSuits = [];

    const vehicleIds = combatants.filter((c) => c.actor.type === 'vehicle').map((c) => c.id);
    const obstaclesIds = combatants.filter((c) => c.actor.type === 'obstacle').map((c) => c.id);
    const hardSuitsIds = combatants.filter((c) => c.actor.type === 'hardSuit').map((c) => c.id);

    context.turns.forEach((t) => {
      if (vehicleIds.includes(t.id)) return context.vehicles.push(t);
      if (obstaclesIds.includes(t.id)) return context.obstacles.push(t);
      if (hardSuitsIds.includes(t.id)) return context.hardSuits.push(t);

      const init = parseInt(t.initiative);
      if (init < 40) context.gmTurns.push(t);
      else context.playerTurns.push(t);
    });
    return context;
  }

  async _renderHTML(context, options) {
    var parts = await super._renderHTML(context, options);

    // Hearts HP progress bar (everything but chunks)
    $(parts.tracker)
      .find('.hearts-container')
      .each((_, hc) => {
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
          const w = 16 * (Math.clamp(dmg, 0, 10) / 10);
          dmg -= 10;
          el.style.width = Math.ceil(w) + 'px';
        });
      });

    // Resources progress bar
    $(parts.tracker)
      .find('.resource-bar-container')
      .each((_, barContainer) => {
        barContainer = $(barContainer);
        const bar = barContainer.find('.resource-bar');
        const target = barContainer.closest('[data-target]').data('target');
        const combatantId = barContainer.closest('[data-combatant-id]').data('combatantId');
        const actor = this.viewed?.combatants.get(combatantId).actor;

        let resource = foundry.utils.getProperty(actor, target);
        if (resource == null) return;
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
    return parts;
  }

  _enrichTurns(turns) {
    const combatants = this.viewed?.combatants;
    if (!combatants) return turns;
    const showMastery = !game.settings.get('icrpgme', 'hideCombatMastery');
    const showSp = !game.settings.get('icrpgme', 'hideCombatSP');

    return turns.map((turn) => {
      const combatant = combatants.get(turn.id);
      const actor = combatant.actor;
      turn.health = actor?.system?.health;
      turn.icrpgActorType = actor.type;
      const type = actor.type;

      // Handle vehicle
      if (type === 'vehicle') {
        turn.chunks = actor.system.chunks;
      }

      // Handle character
      if (type === 'character') {
        turn.defense = actor.system.attributes.defense.total;
      }

      // Set collapsed state
      if (!this.isIdCollapsed.has(combatant.id)) this.isIdCollapsed.set(combatant.id, true);
      turn.collapsed = this.isIdCollapsed.get(combatant.id);

      // Resources
      turn.showMastery = showMastery;
      turn.showSp = showSp;
      turn.showResources = (turn.isOwner || turn.isGM) && ['character', 'monster'].includes(type);
      if (turn.showResources) {
        turn.mastery = actor.system.mastery;
        turn.sp = actor.system.sp;
        turn.resources = actor.system.resources ?? [];
      }
      if (turn.showResources) turn.showResources = showMastery || showSp || turn.resources?.length > 0;

      // Handle hard suit
      if (type === 'hardSuit') {
        turn.parts = actor.items.filter((i) => i.type === 'part').sort((a, b) => a.name.localeCompare(b.name));
        turn.power = actor.system.power.value;
      }
      return turn;
    });
  }

  _onRender(context, options) {
    // super.activateListeners(html);
    super._onRender(context, options);
    const html = $(this.element);

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
      const oldValue = foundry.utils.getProperty(actor, target);
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
        return actor.update({ [target]: Math.clamp(0, newValue, 20) });
      }

      // If SP
      if (target.includes('sp')) {
        const resource = foundry.utils.getProperty(actor, target);
        target += `.value`;
        return actor.update({ [target]: Math.clamp(newValue, 0, resource.max) });
      }

      // If power
      if (target.includes('power')) {
        return actor.update({ [target]: Math.clamp(0, newValue, 100) });
      }

      // If generic
      const resources = actor.system.resources;
      const index = ct.closest('[data-resource-index]').data('resourceIndex');
      resources[index].value = Math.clamp(newValue, 0, resources[index].max);
      actor.update({ 'system.resources': resources }, { updateResourceIndex: index });
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
      if (foundry.utils.getProperty(item, target) === value) value -= 1;
      item.update({ [target]: value });
    });

    // Hover on combatant with ctrl
    if (game.user.isGM)
      html.find('.combatant[data-combatant-id]').hover(
        (ev) => {
          if (!ev.ctrlKey) return;
          // Grab last message and roll total
          const lastMessage = game.messages.contents.at(-1);
          if (!lastMessage?.rolls?.length) return;
          const total = lastMessage.rolls.reduce((total, roll) => roll.total + total, 0);
          // Update the hp input(s)
          const damageInput = $(ev.currentTarget).find('input[data-target="system.health.damage"]');
          damageInput.val('+' + total);
          const valueInput = $(ev.currentTarget).find('input[data-target="system.health.value"]');
          valueInput.val('-' + total);
          // Add click ev listener
          this.ctrlHoverId = ev.currentTarget.dataset.combatantId;
          ev.currentTarget.addEventListener(
            'click',
            (ev.currentTarget.fn = () => damageInput.add(valueInput).trigger('change')),
          );
        },
        (ev) => {
          if (!this.ctrlHoverId) return;
          // Reset inputs
          $(ev.currentTarget)
            .find('input[data-target="system.health.damage"]')
            .val(this.viewed?.combatants.get(this.ctrlHoverId).actor.system.health.damage);
          $(ev.currentTarget)
            .find('input[data-target="system.health.value"]')
            .val(this.viewed?.combatants.get(this.ctrlHoverId).actor.system.health.value);
          // Remove listener
          ev.currentTarget.removeEventListener('click', ev.currentTarget.fn);
          this.ctrlHoverId = null;
        },
      );
    console.log(html.find("[data-control='addObstacle']"));
    html.find("[data-control='addObstacle']").click(() => this.viewed?.addObstacle());
  }
}

initializeDraggableCombatTracker();
Hooks.on('updateActor', async (actor, changes, _options, _userID) => {
  game.combats.apps.forEach((a) => a.render());
  if (!game.user.isGM) return;

  if (actor.type === 'obstacle' && changes.name != null) {
    game.combats.forEach((combat) => {
      combat.combatants.filter((c) => c.actor === actor).forEach((c) => c.update({ name: changes.name }));
    });
  }

  // Toggle the defeated status when a non-character actor hp changes
  const isHpUpdated = changes?.system?.health != null;
  if (actor.type !== 'character' && isHpUpdated) {
    game.combats.forEach((combat) => {
      combat.combatants
        .filter((c) => c.actor === actor)
        .forEach((c) => c.update({ defeated: actor.system.health?.value === 0 }));
    });
  }
});
