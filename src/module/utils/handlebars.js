import { i18n } from './utils.js';

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper('localizeConcat', _localizeConcat);
  Handlebars.registerHelper('localizeConcatIf', _localizeConcatIf);
  Handlebars.registerHelper('localizationHas', (x) => game.i18n.has(x));
  Handlebars.registerHelper('defaultValue', (x, y) => (x ? x : y));
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
