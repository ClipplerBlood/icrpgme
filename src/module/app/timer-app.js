import { ICRPGBaseApp } from './base-app.js';
import { postRollMessage } from '../chat/chat-roll';
import { i18n } from '../utils/utils.js';

export class ICRPGTimerApp extends ICRPGBaseApp {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/timer-app.html',
      classes: ['icrpg-app-timer'],
      title: 'ICRPG APP', // Needed otherwise it can break
    });
  }

  static async defaultValue() {
    const timerRoll = new Roll('1d4', { label: i18n('ICRPG.timer') });
    await timerRoll.roll({ async: true });
    const timerValue = timerRoll.total;
    await postRollMessage(undefined, timerRoll);
    return {
      timer: timerValue,
      name: '',
    };
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
