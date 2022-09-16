export function i18n(s) {
  return game.i18n.localize(s);
}

Hooks.on('renderActorSheet', (app, html, data) => _onRenderInner(app, html, data));

// eslint-disable-next-line no-unused-vars
function _onRenderInner(app, html, data) {
  _initializeAutosize(html);
  html.find('nav > *:not(.active)').click(() => setTimeout(() => _initializeAutosize(html), 20));
}

function _initializeAutosize(html) {
  console.log('x');
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
