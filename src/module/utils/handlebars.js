import { i18n } from './utils.js';

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
