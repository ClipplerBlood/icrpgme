import { postRollMessage } from '../chat/chat-roll.js';

export class ICRPGCombat extends Combat {
  getInitiativeValue(combatant) {
    let init = Math.round(Math.random() * 50);
    if (combatant.actor.type === 'character' && !combatant.isNPC) init += 50;
    return init;
  }

  /**
   * Roll initiative for one or multiple Combatants within the Combat document
   * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
   * @param {object} [options={}]     Additional options which modify how initiative rolls are created or presented.
   * @param {string|null} [options.formula]         A non-default initiative formula to roll. Otherwise, the system
   *                                                default is used.
   * @param {boolean} [options.updateTurn=true]     Update the Combat turn after adding new initiative scores to
   *                                                keep the turn on the same Combatant.
   * @param {object} [options.messageOptions={}]    Additional options with which to customize created Chat Messages
   * @returns {Promise<Combat>}       A promise which resolves to the updated Combat document once updates are complete.
   */
  // eslint-disable-next-line no-unused-vars
  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    // Structure input data
    ids = typeof ids === 'string' ? [ids] : ids;
    const combatantUpdates = [];
    const currentId = this.combatant?.id;

    for (const id of ids) {
      // Get combatant. Skip if not owner or defeated
      const combatant = this.combatants.get(id);
      if (!combatant?.isOwner || combatant.defeated) continue;

      // Push the update and init message
      combatantUpdates.push({ _id: combatant.id, initiative: this.getInitiativeValue(combatant) });
      // Update multiple combatants
      await this.updateEmbeddedDocuments('Combatant', combatantUpdates);

      // Ensure the turn order remains with the same combatant
      if (updateTurn && currentId) {
        await this.update({ turn: this.turns.findIndex((t) => t.id === currentId) });
      }
    }
  }

  async shuffleCombatants() {
    const combatantUpdates = this.combatants.map((c) => ({
      _id: c.id,
      initiative: this.getInitiativeValue(c),
    }));
    if (combatantUpdates.length > 0) return this.updateEmbeddedDocuments('Combatant', combatantUpdates);
  }

  /**
   * Roll initiative for all players and gm, setting the current turn to the highest
   */
  async rollAll() {
    let maxRoll = 0;
    let maxTurnIndex;

    const _initRoll = async (c, index) => {
      const r = new Roll('1d20', { name: 'initiative' });
      await r.roll({ async: true });
      await postRollMessage(c?.actor, r);

      if (r.total <= maxRoll) return;
      maxTurnIndex = index;
      maxRoll = r.total;
    };

    // Roll players
    let lastPlayerTurnIndex = 0;
    for (const [i, c] of this.turns.entries()) {
      if (!(c.actor.type === 'character' && !c.isNPC)) continue;
      await _initRoll(c, i);
      lastPlayerTurnIndex = i;
    }

    // If there are other combatants, also roll for GM
    if (lastPlayerTurnIndex <= this.turns.length) {
      await _initRoll(undefined, -1);
    }

    // If gm is highest, use the index of the first NPC after the players
    if (maxTurnIndex === -1) {
      maxTurnIndex = lastPlayerTurnIndex + 1;
    }
    this.update({ turn: maxTurnIndex });
  }
}

// When a combatant is created, get its initiative from the actor
Hooks.on('preCreateCombatant', (combatant, _data, _options, userId) => {
  if (game.userId !== userId) return;
  combatant.updateSource({ initiative: game.combat.getInitiativeValue(combatant) });
});
