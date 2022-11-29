/* globals PIXI */

export class ICRPGToken extends Token {
  /**
   * Draw a single resource bar, given provided data
   * @param {number} number       The Bar number
   * @param {PIXI.Graphics} bar   The Bar container
   * @param {Object} data         Resource data for this bar
   * @protected
   */
  _drawBar(number, bar, data) {
    // If not health, skip
    if (data.attribute !== 'health' || !useTokenHearts) return super._drawBar(number, bar, data);

    // Grab actor data
    let hp = this.actor.system.health.value;
    let nHearts = this.actor.system.health.hearts;

    // Configure size and positioning
    const size = 16;
    const gap = 2;
    // Set the initial offset (distance from the center)
    let offset = -Math.floor(nHearts / 2) * size - gap;
    // Set the centering offset (if number of hearts is odd, shift them by half width)
    const centering = nHearts % 2 ? size / 2 : 0;

    // Remove old stuff
    bar.clear();
    bar.children = [];

    for (let h = 0; h < nHearts; h++) {
      // Get the "relative" hp of the current heart
      const r = Math.clamped(hp, 0, 10);
      hp -= 10;

      // Grab the sprite and set its dimensions
      const hpSprite = new PIXI.Sprite(textureHeart[r]);
      hpSprite.width = size;
      hpSprite.height = size;
      // Set y to bottom
      hpSprite.y = this.h - hpSprite.height;
      // Set x
      hpSprite.x = this.w / 2 + offset - centering;
      // Increase the offset
      offset += size + gap;
      bar.addChild(hpSprite);
    }
  }

  displayFloatingText(content) {
    const textStyle = { fontSize: 22 };
    return canvas.interface.createScrollingText(this.center, content, {
      anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
      ...textStyle,
    });
  }
}

// Load all textures once init
let useTokenHearts = true;
let textureHeart = {};
Hooks.once('ready', async () => {
  for (let i = 0; i <= 10; i++) {
    textureHeart[i] = await loadTexture(`systems/icrpgme/assets/ui/token-bar/token-heart-${i}.webp`);
  }
  useTokenHearts = game.settings.get('icrpgme', 'useTokenHearts');
  setTimeout(() => {
    if (canvas.scene) canvas.draw();
  }, 10);
});

/**
 * Actor floating text hooks
 */

function displayActorFloatingText(actor, content) {
  if (!content || content.length === 0) return;
  if (content instanceof Array) content = content.join('\n');
  actor?.getActiveTokens().forEach((t) => t.displayFloatingText(content));
}

const fmt = (loc, data) => game.i18n.format('ICRPG.tokenFloatingText.' + loc, data);

Hooks.on('updateActor', (actor, diff, context, _userId) => {
  const { heroCoin, dyingRounds, mastery, sp, resources } = diff.system ?? {};
  const content = [];

  if (heroCoin != null) content.push(fmt(heroCoin ? 'herocoinAdd' : 'herocoinUse', {}));
  if (mastery != null) content.push(fmt('mastery', { x: mastery }));
  if (sp != null) content.push(fmt('sp', actor.system.sp));
  if (dyingRounds != null) content.push(fmt('dying', { x: dyingRounds }).toUpperCase());
  if (resources != null && context.updateResourceIndex != null) {
    const res = resources[context.updateResourceIndex];
    if (res.value != null && res.max != null && res.name) content.push(fmt('resource', res).toUpperCase());
  }

  displayActorFloatingText(actor, content);
});

Hooks.on('updateItem', (item, diff, _context, _userId) => {
  if (!item.parent || !diff.system) return;
  const actor = item.parent;
  const { equipped, carried, mastery } = diff.system;
  const content = [];

  if (equipped != null) content.push(fmt(equipped ? 'itemEquip' : 'itemUnequip', item).toUpperCase());
  if (carried != null) content.push(fmt(carried ? 'itemCarry' : 'itemUncarry', item).toUpperCase());
  if (mastery != null && item.type === 'power') content.push(fmt('powerMastery', { name: item.name, mastery }));
  displayActorFloatingText(actor, content);
});

Hooks.on('createItem', (item, _context, _userId) => {
  if (!item.parent) return;
  displayActorFloatingText(item.parent, fmt('itemCreate', item).toUpperCase());
});

Hooks.on('deleteItem', (item, _context, _userId) => {
  if (!item.parent) return;
  displayActorFloatingText(item.parent, fmt('itemDelete', item).toUpperCase());
});
