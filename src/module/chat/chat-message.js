import { postRollMessage } from './chat-roll.js';

export class ICRPGRollMessage extends ChatMessage {
  static create(messageData, messageOptions) {
    // Intercept roll creation
    if (messageData.type === CONST.CHAT_MESSAGE_TYPES.ROLL) {
      return postRollMessage(undefined, messageData.rolls[0], messageOptions);
    }
    return super.create(messageData, messageOptions);
  }
}
