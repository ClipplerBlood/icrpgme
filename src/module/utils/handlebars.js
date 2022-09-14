import { i18n } from './utils.js';

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper('localizeConcat', _localizeConcat);
  Handlebars.registerHelper('defaultValue', (x, y) => (x ? x : y));
}

function _localizeConcat(...args) {
  args.pop(); // Last element is data
  return i18n(args.join(''));
}
