import { _getBaseMessageData } from './chat-common.js';

export async function postItemMessage(
  actor,
  item,
  itemOptions = {},
  chatOptions = { temporary: false },
  messageData = {},
) {
  // If the item is a string, then treat it as an ID
  if (typeof item === 'string') item = actor.items.get(item);
  if (!item) throw 'Item not found in actor';

  // Build the message and post it
  messageData = mergeObject(_getBaseMessageData(actor), messageData);
  messageData.content = await renderTemplate('systems/icrpgme/templates/chat/item.html', {
    actor: actor,
    item: item,
    messageData: messageData,
    itemOptions: itemOptions,
  });

  return ChatMessage.create(messageData, chatOptions);
}

export async function postArrayActionMessage(
  actor,
  { name, description },
  chatOptions = { temporary: false },
  messageData = {},
) {
  messageData = mergeObject(_getBaseMessageData(actor), messageData);
  messageData.content = await renderTemplate('systems/icrpgme/templates/chat/action.html', {
    actor: actor,
    name,
    description,
    messageData: messageData,
  });
  return ChatMessage.create(messageData, chatOptions);
}
