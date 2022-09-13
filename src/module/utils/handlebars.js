import { i18n } from './utils.js';

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper('localizeConcat', _localizeConcat);
}

function _localizeConcat(...args) {
  args.pop(); // Last element is data
  return i18n(args.join(''));
}
