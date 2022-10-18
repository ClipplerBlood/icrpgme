import { i18n } from './utils/utils.js';
import { TimerTargetContainer } from './app/timer-target-app.js';

Hooks.once('ready', () => {
  const app = TimerTargetContainer.create();
  if (app.targets.length === 0 && game.user.isGM) app.addTarget();
});

Hooks.on('collapseSidebar', () => game.icrpgme.timerTargetContainer?.render());

export function registerICRPGTools() {
  Hooks.on('getSceneControlButtons', (controls) => {
    if (!game.user.isGM) return;
    controls.push({
      name: 'icrpgme-tools',
      title: i18n('ICRPG.tooltips.tools'),
      layer: 'controls',
      icon: 'fas fa-toolbox',
      visible: true,
      tools: [
        {
          icon: 'fas fa-dice-d20',
          name: 'icrpg-target',
          title: i18n('ICRPG.tooltips.target'),
          onClick: () => game.icrpgme.timerTargetContainer?.addTarget(),
        },
        {
          icon: 'fas fa-hourglass',
          name: 'icrpg-timer',
          title: i18n('ICRPG.tooltips.timer'),
          onClick: () => game.icrpgme.timerTargetContainer?.addTimer(),
        },
        {
          icon: 'fa-duotone fa-cards-blank',
          name: 'icrpg-card',
          title: i18n('ICRPG.tooltips.indexCard'),
          onClick: () => Hooks.call('requestSketchTile'),
        },
      ],
    });
  });
}
