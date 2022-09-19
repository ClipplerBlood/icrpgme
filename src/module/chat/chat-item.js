import { _getBaseMessageData } from './chat-common.js';

export async function postItemMessage(actor, item, options = { temporary: false }, messageData = {}) {
  // If the item is a string, then treat it as an ID
  if (typeof item === 'string') item = actor.items.get(item);
  if (!item) throw 'Item not found in actor';

  // Build the message and post it
  messageData = mergeObject(_getBaseMessageData(actor), messageData);
  messageData.content = await renderTemplate('systems/icrpgme/templates/chat/item.html', {
    actor: actor,
    item: item,
    messageData: messageData,
  });

  return ChatMessage.create(messageData, options);
}
