import { ICRPGBaseApp } from './base-app.js';

export class ICRPGTimerApp extends ICRPGBaseApp {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/timer-app.html',
      classes: ['icrpg-app-timer'],
      title: 'ICRPG APP', // Needed otherwise it can break
    });
  }
  static get width() {
    return 100;
  }

  static get height() {
    return 120;
  }
  static async defaultValue() {
    return {
      timer: 4,
      name: '',
    };
    // const timerRoll = new Roll('1d4', { label: i18n('ICRPG.timer') });
    // await timerRoll.roll({ async: true });
    // const timerValue = timerRoll.total;
    // await postRollMessage(undefined, timerRoll);
    // return {
    //   timer: timerValue,
    //   name: '',
    // };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Inputs
    html.find("input[name='timer']").on('input', (ev) =>
      this.constructor.setStoredData(this.icrpgID, {
        'value.timer': parseInt(ev.currentTarget.value),
      }),
    );

    html.find("textarea[name='name']").on('input', (ev) => {
      this.constructor.setStoredData(this.icrpgID, {
        'value.name': ev.currentTarget.value,
      });
    });
  }
}
