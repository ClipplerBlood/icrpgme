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

/**
 * Utility function that handles changes in array properties of actors and items sheets
 * @param array original array
 * @param ev event firing the operation in the sheet
 * @param index index of modified entry. Negative indices indicate creation
 * @param defaultNewEntryVal default value for new entries
 * @return {*} the changed array
 */
export function onArrayEdit(array, ev, index, defaultNewEntryVal = {}) {
  const ct = $(ev.currentTarget);
  const target = ct.closest('[data-target]').data('target');
  const value = ct.val();

  if (index < 0) {
    // Create
    array.push(mergeObject(defaultNewEntryVal, { name: target === 'name' ? value : '', description: '' }));
  } else {
    // Update
    const datum = array[index];
    datum.name = target === 'name' ? value : datum.name;
    datum.description = target === 'description' ? value : datum.description;

    // Delete
    if (!datum.name.length) array.splice(index, 1);
  }
  return array;
}

/**
 * Builds an object containing the INNER NUMERICAL result from the operator between two objects. NOT COMMUTATIVE
 * EG : innerNumericalOperation(
 *      {x: {xx: 1}, y: "z"},
 *      {x: {xx: 0, xy: 0}, y: "k"},
 *      (x,y) => x-y)
 *  = {x: {xx: 1}}
 * @param a
 * @param b
 * @param  {function} op
 */
export function innerNumericalOperation(a, b, op) {
  let result = {};
  for (let key of Object.keys(a)) {
    const va = a[key];
    const vb = b[key];
    if (va == null || vb == null) continue;
    if (typeof va !== typeof vb) continue;
    if (typeof va === 'object') {
      const diff = innerNumericalOperation(va, vb, op);
      if (diff == null || Object.keys(diff).length === 0) continue;
      result[key] = mergeObject(result[key] ?? {}, diff);
      continue;
    }

    const na = Number(va);
    const nb = Number(vb);
    if (isNaN(na) || isNaN(nb)) return;
    result[key] = op(na, nb);
  }
  if (Object.keys(result).length === 0) return;
  return result;
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
