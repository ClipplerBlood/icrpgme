import { ICRPGBaseApp } from './base-app.js';

export class ICRPGTargetApp extends ICRPGBaseApp {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/target-app.html',
      classes: ['icrpg-app-target'],
      title: 'ICRPG APP', // Needed otherwise it can break
    });
  }

  static get width() {
    return 120;
  }

  static get height() {
    return 120;
  }

  static async defaultValue() {
    return {
      target: 10,
      isEasy: false,
      isHard: false,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Inputs
    html.find("input[name='target']").on('input', (ev) =>
      this.constructor.setStoredData(
        this.icrpgID,
        expandObject({
          'value.target': parseInt(ev.currentTarget.value),
        }),
      ),
    );

    html.find("[name='isEasy']").click((ev) => {
      this.constructor
        .setStoredData(
          this.icrpgID,
          expandObject({
            'value.isEasy': !(ev.currentTarget.getAttribute('value') === 'true'),
            'value.isHard': false,
          }),
        )
        .then(() => this.render());
    });

    html.find("[name='isHard']").click((ev) => {
      this.constructor
        .setStoredData(
          this.icrpgID,
          expandObject({
            'value.isHard': !(ev.currentTarget.getAttribute('value') === 'true'),
            'value.isEasy': false,
          }),
        )
        .then(() => this.render());
    });
  }
}
