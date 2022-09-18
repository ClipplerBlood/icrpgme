import { ICRPGBaseApp } from './base-app.js';

export class ICRPGTimerApp extends ICRPGBaseApp {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/timer-app.html',
      classes: ['icrpg-app-target'],
      height: 128,
      width: 128,
      title: 'ICRPG APP', // Needed otherwise it can break
    });
  }
}
