import { _getBaseMessageData } from './chat-common.js';

async function _renderRollMessage(messageData, context = {}) {
  const rolls = messageData.rolls;
  if (rolls && game.dice3d) {
    for (let roll of rolls) {
      await game.dice3d.showForRoll(roll, game.user, true, messageData.whisper, messageData.blind);
    }
  }
  // V12 patch
  if ('temporary' in context && !context.temporary) {
    delete context.temporary;
  }
  return ChatMessage.create(messageData, context);
}

export async function postRollMessage(actor, roll, context = { temporary: false }, messageData = {}) {
  if (typeof roll === 'string' || roll instanceof String) {
    roll = JSON.parse(roll);
    let _roll = Roll.create('', roll);
    console.log(_roll);
  }
  if (!roll._evaluated && roll.roll != null) await roll.evaluate();

  // Prepare chat data
  messageData = foundry.utils.mergeObject(_getBaseMessageData(actor, [roll]), messageData);
  messageData.content = await renderTemplate('systems/icrpgme/templates/chat/roll.html', {
    actor: actor,
    roll: roll,
    messageData: messageData,
  });

  return _renderRollMessage(messageData, context);
}
