import { i18n, romanize } from './utils.js';

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper('defaultValue', (x, y) => (x ? x : y));
  Handlebars.registerHelper('localizeConcat', _localizeConcat);
  Handlebars.registerHelper('localizeConcatIf', _localizeConcatIf);
  Handlebars.registerHelper('localizationHas', (x) => game.i18n.has(x));
  Handlebars.registerHelper('localizeType', (d) => i18n(`${d.documentName.toUpperCase()}.Type${d.type.titleCase()}`));
  Handlebars.registerHelper('readonly', (x) => (x ? 'readonly' : ''));
  Handlebars.registerHelper('plusify', (x) => (x > 0 ? '+' + x : String(x)));
  Handlebars.registerHelper('times', _times);
  // Handlebars.registerHelper('sum', (x, y) => x + y);
  Handlebars.registerHelper('inc', (x) => x + 1);
  Handlebars.registerHelper('healthImageChooser', _healthImageChooser);
  Handlebars.registerHelper('romanize', romanize);
  Handlebars.registerHelper('spellPrefix', _spellPrefix);
}

function _localizeConcat(...args) {
  args.pop(); // Last element is data
  return i18n(args.join(''));
}

function _localizeConcatIf(...args) {
  args.pop();
  const s = args.join('');
  if (!game.i18n.has(s)) return '';
  return i18n(s);
}

function _times(n, block) {
  var accum = '';
  for (var i = 0; i < n; ++i) {
    block.data.index = i;
    block.data.first = i === 0;
    block.data.last = i === n - 1;
    accum += block.fn(this);
  }
  return accum;
}

function _healthImageChooser(actor, heartIndex) {
  const heartMaxHp = (heartIndex + 1) * 10;
  const actorMaxHp = actor.system.health.max;
  if (actor.type === 'character') {
    if (actorMaxHp >= heartMaxHp) return 'systems/icrpgme/assets/ui/char-heart-red.webp';
    else if (actorMaxHp >= heartMaxHp - 5) return 'systems/icrpgme/assets/ui/char-heart-half-red.webp';
    else return 'systems/icrpgme/assets/ui/char-heart-grey.webp';
  } else {
    if (actorMaxHp >= heartMaxHp) return 'systems/icrpgme/assets/ui/heart-red.webp';
    else if (actorMaxHp >= heartMaxHp - 5) return 'systems/icrpgme/assets/ui/heart-half-red.webp';
    else return 'systems/icrpgme/assets/ui/heart-grey-2.webp';
  }
}

function _spellPrefix(spell) {
  const system = spell.system;
  let prefix = '';
  prefix += system.spellType ?? '';
  prefix += ' ' + romanize(system.spellLevel) ?? '';
  prefix = prefix.trim();
  if (prefix.length === 0) return '';
  const html = `<b class="tt-u ff-content" style="font-size: 0.95rem; flex: 0; white-space: nowrap; margin-right: 4px;">${prefix}:</b>`;
  return new Handlebars.SafeString(html);
}
