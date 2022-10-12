import { ICRPGBaseApp } from './app/base-app.js';
import { i18n } from './utils/utils.js';
import { ICRPGTargetApp } from './app/target-app.js';
import { ICRPGTimerApp } from './app/timer-app.js';

export function registerICRPGTools() {
  Hooks.once('ready', async () => renderStoredApps());
  Hooks.once('init', async () => game.socket.on('system.icrpgme', icrpgAppsListener));
  Hooks.once('ready', () => addEventListener('resize', icrpgViewportResizeListener));
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
          onClick: () => ICRPGTargetApp.create(randomID(), game.user.id),
        },
        {
          icon: 'fas fa-hourglass',
          name: 'icrpg-timer',
          title: i18n('ICRPG.tooltips.timer'),
          onClick: () => ICRPGTimerApp.create(randomID(), game.user.id),
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

export function icrpgAppsListener(data) {
  // Remember that the socket 'on' function does not run for the emitter client
  const icrpgID = data.icrpgID;
  if (!icrpgID) return;
  const cls = getAppClassByName(data.className);
  switch (data.action) {
    // case 'position':
    //   cls.getApp(icrpgID)?.setRelativePosition(data.position);
    //   break;
    case 'create':
      cls.create(icrpgID, undefined);
      break;
    case 'close':
      cls.destroy(icrpgID);
      break;
    case 'change':
      cls.getApp(icrpgID)?.render();
  }
}

function renderStoredApps() {
  const apps = game.settings.get('icrpgme', 'appData');
  for (const [id, appData] of Object.entries(apps)) {
    getAppClassByName(appData.className).create(id, undefined);
  }
}

function getAppClassByName(className) {
  switch (className) {
    case 'ICRPGTargetApp':
      return ICRPGTargetApp;
    case 'ICRPGTimerApp':
      return ICRPGTimerApp;
    default:
      return ICRPGBaseApp;
  }
}

function icrpgViewportResizeListener(_event) {
  game.icrpgme.apps.forEach((app) => {
    const position = app.constructor.getStoredData(app.icrpgID)?.position;
    if (position) app.setRelativePosition(position);
  });
}
