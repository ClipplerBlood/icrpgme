async function _renderRollMessage(messageData, options = {}) {
  const rolls = messageData.rolls;
  if (rolls && game.dice3d) {
    for (let roll of rolls) {
      await game.dice3d.showForRoll(roll, game.user, true, messageData.whisper, messageData.blind);
    }
  }
  return ChatMessage.create(messageData, options);
}

function _getBaseMessageData(actor = undefined, rolls = undefined) {
  const rollMode = game.settings.get('core', 'rollMode');
  return {
    user: game.user.id,
    speaker: {
      actor: actor?.id,
      token: actor?.token,
      alias: actor?.name,
    },
    rolls: rolls,
    blind: rollMode === 'blindroll',
    whisper:
      rollMode === 'selfroll'
        ? [game.user.id]
        : rollMode === 'gmroll' || rollMode === 'blindroll'
        ? ChatMessage.getWhisperRecipients('GM')
        : [],
  };
}

export async function postRollMessage(actor, roll, options = { temporary: false }, messageData = {}) {
  if (!roll._evaluated) await roll.roll({ async: true });

  // Prepare chat data
  messageData = mergeObject(_getBaseMessageData(actor, [roll]), messageData);
  messageData.content = await renderTemplate('systems/icrpgme/templates/chat/roll.html', {
    actor: actor,
    roll: roll,
    messageData: messageData,
  });

  return _renderRollMessage(messageData, options);
}
