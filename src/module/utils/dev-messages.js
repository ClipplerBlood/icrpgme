import { i18n } from './utils.js';

export function sendDevMessages() {
  $.ajax({
    cache: false,
    url: 'https://raw.githubusercontent.com/ClipplerBlood/icrpgme/master/src/dev-messages.json',
    dataType: 'json',
    success: function (data) {
      if (data.messages === undefined || data.messages === null || data.messages.length === undefined) return;
      data.messages.forEach(_sendMsg);
    },
  });
}

function _sendMsg(msgData) {
  const isGM = game.user.isGM;
  if (msgData == null) return;
  if (msgData.gmOnly && !isGM) return;
  if (msgData.disabled) return;
  if (msgData.minVersion && isNewerVersion(game.system.version, msgData.minVersion)) return;
  if (msgData.maxVersion && isNewerVersion(msgData.maxVersion, game.system.version)) return;

  const receivedDevMsgIndex = game.user.getFlag('icrpgme', 'receivedDevMsgIndex') ?? -1;
  if (receivedDevMsgIndex >= msgData.index) return;
  game.user.setFlag('icrpgme', 'receivedDevMsgIndex', msgData.index);

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ alias: i18n('FONTS.TypeSystem') }),
    whisper: [game.user],
    content: msgData.message,
    timestamp: msgData.timestamp,
  });
}
