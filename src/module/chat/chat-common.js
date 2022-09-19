export function _getBaseMessageData(actor = undefined, rolls = undefined) {
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
        : null,
  };
}
