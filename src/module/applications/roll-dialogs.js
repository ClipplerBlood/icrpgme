import { i18n } from '../utils/utils.js';

export function createRollDialog(rollCallback, options = { initialMod: 0 }) {
  const im = options.initialMod ?? 0;
  const d = new Dialog({
    title: i18n('ICRPG.roll.roll'),
    content: `
    <div class="flex-row" style="margin: 16px">
    <div>${i18n('ICRPG.roll.modifier')}</div>
    <input type="number" name="mod" value="${im}">
    </div>
    `,
    buttons: {
      roll: {
        icon: '<i class="fas fa-d20"></i>',
        label: i18n('ICRPG.roll.roll'),
        callback: rollCallback,
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: i18n('Cancel'),
        callback: () => {},
      },
    },
  });
  d.render(true);
}

export function requestRollDialog(actor, rollName, rollGroup, dialogOptions = {}) {
  createRollDialog((html) => {
    const chosenMod = parseInt(html.find('[name="mod"]').val()) ?? 0;
    actor.roll(rollName, rollGroup, { mod: chosenMod });
  }, dialogOptions);
}
