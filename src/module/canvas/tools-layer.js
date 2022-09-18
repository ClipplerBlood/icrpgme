import { ICRPGTargetApp } from '../app/target-app.js';
import { i18n } from '../utils/utils.js';

export class ICRPGToolsLayer extends CanvasLayer {
  static register() {
    Hooks.on('icrpgTargetAdd', (icrpgID, callerId) => ICRPGTargetApp.create(icrpgID, callerId));
    Hooks.on('icrpgTargetRemove', () => console.log('icrpgTargetRemove'));
    Hooks.on('icrpgTimerAdd', () => console.log('icrpgTimerAdd'));
    Hooks.on('icrpgTimerRemove', () => console.log('icrpgTimerRemove'));

    Hooks.on('ready', async () => renderStoredApps());
    Hooks.once('init', async () => game.socket.on('system.icrpgme', icrpgAppsListener));

    Hooks.on('getSceneControlButtons', (controls) => {
      if (!game.user.isGM) return;
      controls.push({
        name: 'icrpgme-tools',
        title: i18n('ICRPG.canvasTooltips.tools'),
        layer: 'controls',
        icon: 'fas fa-toolbox',
        visible: true,
        tools: [
          {
            icon: 'fas fa-dice-d20',
            name: 'icrpg-target',
            title: i18n('ICRPG.canvasTooltips.target'),
            onClick: () => {
              ICRPGTargetApp.create(randomID(), game.user.id);
            },
          },
          {
            icon: 'fas fa-hourglass',
            name: 'icrpg-timer',
            title: i18n('ICRPG.canvasTooltips.timer'),
            onClick: () => Hooks.call('icrpgTimerAdd', game.user.id),
          },
        ],
      });
    });
  }
}

export function icrpgAppsListener(data) {
  // Remember that the socket 'on' function does not run for the emitter client
  console.log(data, game.icrpgme.apps);
  const icrpgID = data.icrpgID;
  if (!icrpgID) return;
  switch (data.action) {
    case 'position':
      ICRPGTargetApp.getApp(icrpgID)?.setRelativePosition(data.position);
      break;
    case 'create':
      ICRPGTargetApp.create(icrpgID, undefined);
      break;
    case 'close':
      ICRPGTargetApp.destroy(icrpgID);
      break;
    case 'value':
      ICRPGTargetApp.getApp(icrpgID)?.render();
  }
}

function renderStoredApps() {
  const targets = ICRPGTargetApp.getObjectMap();
  for (const id of Object.keys(targets)) {
    ICRPGTargetApp.create(id);
  }
}
