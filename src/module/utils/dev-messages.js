import { i18n } from './utils.js';

export function sendDevMessages() {
  $.getJSON('https://raw.githubusercontent.com/ClipplerBlood/icrpgme/dev-msg/src/dev-messages.json', function (data) {
    if (data.messages === undefined || data.messages === null || data.messages.length === undefined) return;
    data.messages.forEach(_sendMsg);
  });
}

function _sendMsg(msgData) {
  const isGM = game.user.isGM;
  if (msgData.gmOnly && !isGM) return;
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ alias: i18n('FONTS.TypeSystem') }),
    whisper: [game.user],
    content: msgData.message,
  });
  console.log(msgData);
}
