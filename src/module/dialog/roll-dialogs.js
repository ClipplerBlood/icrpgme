import { i18n } from '../utils/utils.js';

export function createRollDialog(rollCallback) {
  const d = new Dialog({
    title: i18n('ICRPG.roll.roll'),
    content: `
    <div class="flex-row"><input type="number" name="mod" value="0"><div>${i18n('ICRPG.roll.modifier')}</div></div>
    `,
    buttons: {
      roll: {
        icon: '<i class="fas fa-d20">',
        label: i18n('ICRPG.roll.roll'),
        callback: rollCallback,
      },
      cancel: {
        icon: '<i class="fas fa-d20">',
        label: i18n('Cancel'),
        callback: () => {},
      },
    },
  });
  d.render(true);
}

export function requestRollDialog(actor, rollName, rollGroup) {
  createRollDialog((html) => {
    const chosenMod = parseInt(html.find('[name="mod"]').val()) ?? 0;
    actor.roll(rollName, rollGroup, { mod: chosenMod });
  });
}
