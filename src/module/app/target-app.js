import { ICRPGBaseApp } from './base-app.js';

export class ICRPGTargetApp extends ICRPGBaseApp {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/target-app.html',
      classes: ['icrpg-app-target'],
      height: 128,
      width: 128,
      title: 'ICRPG APP', // Needed otherwise it can break
    });
  }
}