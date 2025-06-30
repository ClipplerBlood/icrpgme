import { postRollMessage } from '../chat/chat-roll.js';
import { i18n } from '../utils/utils.js';
import { ICRPGActor } from './actor.js';

export class ICRPGCombat extends Combat {
  getInitiativeValue(combatant) {
    let init = Math.floor(Math.random() * 20);
    if (combatant.actor.type === 'character' && !combatant.isNPC) init += 40;
    else if (combatant.actor.type !== 'obstacle') init += 20;
    return init;
  }

  /**
   * Begin the combat encounter, advancing to round 1 and turn 1
   * If turn already determined by the ICRPG initiative roll, use it
   * @returns {Promise<Combat>}
   */
  async startCombat() {
    this._playCombatSound('startEncounter');
    const updateData = { round: 1 };
    if (this.turn == null) updateData.turn = 0;
    Hooks.callAll('combatStart', this, updateData);
    return this.update(updateData);
  }

  /**
   * Advance the combat to the next turn
   * @returns {Promise<Combat>}
   */
  async nextTurn() {
    let turn = this.turn ?? -1;

    // Determine the next turn number
    let next = null;
    for (let [i, t] of this.turns.entries()) {
      if (i <= turn) continue;
      // Skip defeated and obstacles
      if (this.settings.skipDefeated && t.isDefeated) continue;
      if (t.actor.type === 'obstacle') continue;
      next = i;
      break;
    }

    // Maybe advance to the next round
    let round = this.round;
    if (this.round === 0 || next === null || next >= this.turns.length) {
      return this.nextRound();
    }

    // Update the document, passing data through a hook first
    const updateData = { round, turn: next };
    const updateOptions = { advanceTime: CONFIG.time.turnTime, direction: 1 };
    Hooks.callAll('combatTurn', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  async previousTurn() {
    if (this.round === 0) return this;
    if (this.turn === 0 || this.turns.length === 0) return this.previousRound();

    // Determine the previous turn number
    let previousTurn = null;
    const reversedTurns = Array.from(this.turns.entries()).reverse();

    for (const [i, t] of reversedTurns) {
      // Skip turns after current turn
      if (i >= this.turn) continue;

      // Skip defeated and obstacles
      if (this.settings.skipDefeated && t.isDefeated) continue;
      if (t.actor.type === 'obstacle') continue;

      previousTurn = i;
      break;
    }

    // Maybe advance to the previous round
    if (this.round > 1 && previousTurn === null) {
      return this.previousRound();
    }

    const advanceTime = this.getTimeDelta(this.round, this.turn, this.round, previousTurn);

    // Update the document, passing data through a hook first
    const updateData = { round: this.round, turn: previousTurn };
    const updateOptions = { direction: -1, worldTime: { delta: advanceTime } };
    Hooks.callAll('combatTurn', this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
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

  async addObstacle() {
    // Folder for storing the obstacle
    const folderName = i18n('ICRPG.obstacles');
    let folder = game.folders.find((f) => f.name === folderName);
    if (!folder) {
      folder = await Folder.create({ name: folderName, type: ICRPGActor.documentName });
    }

    // Create the obstacle
    let obstacleName = i18n('TYPES.Actor.obstacle');
    let actor = await Actor.create({
      name: obstacleName,
      type: 'obstacle',
      folder: folder.id,
    });

    // Create the token at the center of the window (snapped)
    const [x, y] = [window.innerWidth / 2, window.innerHeight / 2];
    const t = canvas.stage.worldTransform;
    const data = canvas.grid.getSnappedPosition((x - t.tx) / canvas.stage.scale.x, (y - t.ty) / canvas.stage.scale.y);
    const td = await actor.getTokenDocument(data);

    const scene = this.scene ?? game.scenes.viewed;
    const token = (await scene.createEmbeddedDocuments('Token', [td]))[0];

    // Add the combatant
    this.createEmbeddedDocuments('Combatant', [
      {
        tokenId: token.id,
        sceneId: scene.id,
        actorId: token.actorId,
        hidden: token.hidden,
      },
    ]);
  }
}

// When a combatant is created, get its initiative from the actor
Hooks.on('preCreateCombatant', (combatant, _data, _options, userId) => {
  if (game.userId !== userId) return;
  combatant.updateSource({ initiative: game.combat.getInitiativeValue(combatant) });
});

// When a combatant changes name or img, update the token and actor accordingly
Hooks.on('updateCombatant', async (combatant, changed, _options, userId) => {
  if (game.userId !== userId) return;
  if (changed.name != null) {
    await combatant.actor.update({ name: changed.name });
    await combatant.token.update({ name: changed.name });
  }
  if (changed.img != null) {
    await combatant.token.update({ 'texture.src': changed.img });
    await combatant.actor.update({ img: changed.img });
  }
});
