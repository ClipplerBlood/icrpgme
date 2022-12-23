import { postRollMessage } from './chat-roll.js';

export class ICRPGRollMessage extends ChatMessage {
  static async create(messageData, messageOptions) {
    // Intercept roll creation
    if (messageData.type === CONST.CHAT_MESSAGE_TYPES.ROLL) {
      return postRollMessage(undefined, messageData.rolls[0], messageOptions);
    }
    return super.create(messageData, messageOptions);
  }
}

Roll.prototype.render = async function ({ flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false } = {}) {
  if (!this._evaluated) await this.evaluate({ async: true });
  const chatData = {
    formula: isPrivate ? '???' : this._formula,
    flavor: isPrivate ? null : flavor,
    user: game.user.id,
    total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
    roll: this,
    noHeader: true,
  };
  return renderTemplate(template, chatData);
};
