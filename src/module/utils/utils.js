export function i18n(s) {
  return game.i18n.localize(s);
}

export function plusify(x) {
  return x >= 0 ? '+' + x : x.toString();
}

export function plusifyMod(x) {
  return x > 0 ? '+' + x : x < 0 ? x.toString() : '';
}

export function trimNewLineWhitespace(x) {
  return x.replace(/^(\s+)/gm, '');
}

export const diceMap = {
  strength: '1d20',
  dexterity: '1d20',
  constitution: '1d20',
  intelligence: '1d20',
  wisdom: '1d20',
  charisma: '1d20',
  defense: '1d20',
  basic: '1d4',
  weapons: '1d6',
  guns: '1d8',
  energy: '1d10',
  ultimate: '1d12',
};

Hooks.on('renderActorSheet', (app, html, data) => _onRenderInner(app, html, data));
Hooks.on('renderItemSheet', (app, html, data) => _onRenderInner(app, html, data));
Hooks.on('renderICRPGBaseApp', (app, html, data) => _onRenderInner(app, html, data));

// eslint-disable-next-line no-unused-vars
function _onRenderInner(app, html, data) {
  _initializeAutosize(html);
  html.find('nav > *').click(() => setTimeout(() => _initializeAutosize(html), 5));
  html.find('textarea').each((_, el) => {
    el.value = trimNewLineWhitespace(el.value);
  });
}

function _initializeAutosize(html) {
  const autoresize = (el) => {
    const jEl = $(el);
    if (jEl.prop('tagName') === 'INPUT') {
      const setSize = () => (el.size = Math.max(1, el.value?.length || el.placeholder?.length));
      setSize();
      el.oninput = setSize;
    } else if (jEl.prop('tagName') === 'TEXTAREA') {
      const getHeight = () => Math.max(0, el?.scrollHeight);
      jEl.height(0);
      jEl.height(getHeight() + 'px');
      el.oninput = () => {
        jEl.height(0);
        jEl.height(getHeight() + 'px');
      };
    }
  };

  html.find('[autosize]').each((_, el) => autoresize(el));
}
