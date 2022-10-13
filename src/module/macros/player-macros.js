import { i18n } from '../utils/utils.js';

function getSelectedActors(options = { warn: true }) {
  const selectedActors = game.canvas.tokens.controlled.map((t) => t.actor);
  if (!selectedActors.length && options.warn) {
    ui.notifications.warn(i18n('ICRPG.notifications.selectOneCharacter'));
  }
  return selectedActors ?? [];
}

export function rollSelected(rollGroup, rollName, mod = 0, showDialog = false) {
  const selectedActors = getSelectedActors();
  if (showDialog) {
    // selectedActors.forEach((actor) => requestRollDialog(actor, rollName, rollGroup, { initialMod: mod }));
  } else {
    selectedActors.forEach((actor) => actor.roll(rollName, rollGroup, { mod: mod }));
  }
}

export async function rollAll(options = { autoClose: true }) {
  let currentActor = getSelectedActors({ warn: false })[0];
  const d = new Dialog(
    {
      title: i18n('ICRPG.roll.roll'),
      buttons: {},
      render: (html) =>
        html.find('[data-roll]').click((ev) => {
          const rollName = $(ev.currentTarget).closest('[data-roll]').data('roll');
          const rollGroup = $(ev.currentTarget).closest('[data-group]').data('group');
          currentActor?.roll(rollName, rollGroup);
          if (options.autoClose) d.close();
        }),
      close: () => {
        console.log('Closing roll dialog');
        Hooks.off('controlToken', updateDialog);
      },
    },
    {
      width: 360,
      height: 380,
      classes: ['icrpg-roll-all-dialog'],
      template: 'systems/icrpgme/templates/dialog/roll-all-dialog.html',
    },
  );

  d.getData = () => {
    if (!currentActor) return {};
    const data = { name: currentActor.name, attributes: {}, efforts: {} };
    if (currentActor.type === 'character') {
      for (const group of ['attributes', 'efforts']) {
        for (const [k, v] of Object.entries(currentActor.system[group])) data[group][k] = v.total;
      }
      // data.attributes.defense -= 10;
    } else if (currentActor.type === 'monster') {
      for (const group of ['attributes', 'efforts']) {
        for (const [k, v] of Object.entries(currentActor.system[group])) {
          if (k === 'all') continue;
          data[group][k] = v + currentActor.system[group].all + currentActor.system.allRollsMod;
        }
      }
      data.attributes.defense = currentActor.system.attributes.all + currentActor.system.allRollsMod;
    }
    return data;
  };
  d.render(true);

  const updateDialog = async (token, isActive) => {
    if (!isActive) return;
    if (token.actor.type === 'obstacle') return;
    currentActor = token.actor;
    d.render();
  };
  Hooks.on('controlToken', updateDialog);
}
