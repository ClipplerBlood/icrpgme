import { i18n } from '../utils/utils.js';

export class TimerTargetContainer extends Application {
  // ======= STATIC =======
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/timer-target-container.html',
      classes: ['timer-target-container'],
      title: 'ICRPG APP', // Needed otherwise it can break
      popOut: false,
    });
  }

  static create() {
    if (game.icrpgme?.timerTargetContainer != null) throw 'Only one Timer container permitted';
    const app = new this();
    app.render(true);
    game.icrpgme.timerTargetContainer = app;
    return app;
  }

  static _onUpdate() {
    game.icrpgme.timerTargetContainer?.render();
  }

  // ======= GETTERS AND SETTERS =======
  get timers() {
    return game.settings.get('icrpgme', 'timers');
  }

  set timers(value) {
    game.settings.set('icrpgme', 'timers', value);
  }

  get targets() {
    return game.settings.get('icrpgme', 'targets');
  }

  set targets(value) {
    game.settings.set('icrpgme', 'targets', value);
  }

  // ======= ADD / DELETE / UPDATE =======
  addTarget(options = {}) {
    this.targets = this.targets.concat([mergeObject({ value: 10, isEasy: false, isHard: false, name: '' }, options)]);
  }

  addTimer(options) {
    this.timers = this.timers.concat([mergeObject({ value: 4, name: '' }, options)]);
  }

  // ======= RENDERING =======
  async _render(force = false, options = {}) {
    await super._render(force, options);
    const margin = 8;
    const sidebarRect = $('#sidebar').get(0).getBoundingClientRect();
    this.element.css('right', window.innerWidth - sidebarRect.left + margin);
    $('#ui-top').css('margin-right', this.element.width() + margin);
    if (game.settings.get('icrpgme', 'useBackground')) this.element.addClass('bg-enabled');
  }

  getData(_options = {}) {
    return {
      user: game.user,
      targets: this.targets,
      timers: this.timers,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!game.user.isGM) return;

    // Inputs
    html.find('input[data-target]').change((ev) => {
      const ct = $(ev.currentTarget);
      const target = ct.data('target');
      const value = ct.val();
      const index = ct.closest('[data-index]').data('index');
      const group = ct.closest('[data-group]').data('group');
      const current = this[group];
      current[index][target] = value;
      this[group] = current;
    });

    // Context Menus
    const remove = (header) => {
      const index = header.closest('[data-index]').data('index');
      const group = header.closest('[data-group]').data('group');
      const current = this[group];
      current.splice(index, 1);
      this[group] = current;
    };
    const toggleDifficulty = (header, target) => {
      const index = header.closest('[data-index]').data('index');
      const current = this.targets;
      const t = current[index];
      if (target === 'isEasy') {
        t.isHard = false;
        t.isEasy = !t.isEasy;
      } else {
        t.isEasy = false;
        t.isHard = !t.isHard;
      }
      this.targets = current;
    };

    ContextMenu.create(this, html, '.target', [
      {
        name: i18n('Delete'),
        icon: '<i class="fas fa-times"></i>',
        condition: (element) => element.data('index') > 0,
        callback: (header) => remove(header),
      },
      {
        name: i18n('ICRPG.hard'),
        icon: '<i class="fa-solid fa-up"></i>',
        callback: (header) => toggleDifficulty(header, 'isHard'),
      },
      {
        name: i18n('ICRPG.easy'),
        icon: '<i class="fa-solid fa-down"></i>',
        callback: (header) => toggleDifficulty(header, 'isEasy'),
      },
    ]);

    ContextMenu.create(this, html, '.timer', [
      {
        name: i18n('Delete'),
        icon: '<i class="fas fa-times"></i>',
        callback: (header) => remove(header),
      },
    ]);
  }
}
