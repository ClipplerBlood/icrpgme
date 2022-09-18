/**
 * Inspiration for the code taken from the original ICRPG system
 * https://github.com/jessev14/FoundryVTT-ICRPG/blob/master/module/apps/globalDC.js
 */
export class ICRPGTargetApp extends Application {
  static getObjectMap() {
    return game.settings.get('icrpgme', 'targets');
  }

  static getValue(id) {
    return this.getObjectMap()[id];
  }

  static async setValue(id, value) {
    const gameTargets = this.getObjectMap();
    gameTargets[id] = value;
    await game.settings.set('icrpgme', 'targets', gameTargets);
    game.socket.emit('system.icrpgme', {
      icrpgID: id,
      action: 'value',
      value: value,
    });
  }

  static deleteValue(id) {
    const gameTargets = this.getObjectMap();
    delete gameTargets[id];
    game.settings.set('icrpgme', 'targets', gameTargets);
    game.socket.emit('system.icrpgme', {
      icrpgID: id,
      action: 'close',
    });
  }

  static setStoredData(id, data) {
    const storedAppData = game.settings.get('icrpgme', 'appData');
    storedAppData[id] = mergeObject(storedAppData[id] ?? {}, data);
    game.settings.set('icrpgme', 'appData', storedAppData);
  }

  static getStoredData(id) {
    return game.settings.get('icrpgme', 'appData')[id];
  }

  static deleteStoredData(id) {
    const storedAppData = game.settings.get('icrpgme', 'appData');
    delete storedAppData[id];
    game.settings.set('icrpgme', 'appData', storedAppData);
  }

  // ----------------------------------------------

  static async create(icrpgID, callerID) {
    console.log('calling create', icrpgID, callerID);

    // Create a new application
    const app = new ICRPGTargetApp();
    app.icrpgID = icrpgID;

    // Get the stored position, render and then set it
    const storedPosition = this.getStoredData(icrpgID)?.position;
    await app._render(true);
    await app.setRelativePosition(storedPosition);

    // Store the application in the client-side storage
    console.assert(!game.icrpgme.apps.has(icrpgID), "App's icrpgID already present");
    game.icrpgme.apps.set(icrpgID, app);

    // If caller (gm) create a new target in the settings and emit creation event
    if (game.userId === callerID) {
      this.setValue(icrpgID, 10);
      game.socket.emit('system.icrpgme', {
        icrpgID: icrpgID,
        action: 'create',
      });
    }
    return app;
  }

  static destroy(icrpgID) {
    game.icrpgme.apps.get(icrpgID)?.close();
    game.icrpgme.apps.delete(icrpgID);
    this.deleteStoredData(icrpgID);
  }

  static getApp(icrpgID) {
    return game.icrpgme.apps.get(icrpgID);
  }

  // ----------------------------------------------
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/icrpgme/templates/app/target-app.html',
      classes: ['icrpg-app-target'],
      height: 128,
      width: 128,
      title: 'ICRPG APP', // Needed otherwise it can break
    });
  }

  async getData() {
    const content = super.getData();
    content.value = this.constructor.getValue(this.icrpgID);
    content.isGM = game.user.isGM;
    return content;
  }

  async _render(force = false, options = {}) {
    await super._render(force, options);
    this.element.css({ height: '128px', width: '128px' });
    // Dodge escape-close
    delete ui.windows[this.appId];
    this.constructor;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!game.user.isGM) return;

    // Dragging
    const handle = html.find('.icrpg-target-container').get(0);
    const draggable = new Draggable(this, html, handle, false);
    draggable._onDragMouseUp = (event) => {
      Draggable.prototype._onDragMouseUp.call(draggable, event);
      this.constructor.setStoredData(this.icrpgID, {
        position: this.getRelativePosition(),
      });
    };
    draggable._onDragMouseMove = (event) => {
      Draggable.prototype._onDragMouseMove.call(draggable, event);
      game.socket.emit('system.icrpgme', {
        icrpgID: this.icrpgID,
        action: 'position',
        position: this.getRelativePosition(),
      });
    };

    // Inputs
    html.find("input[name='value']").on('input', (ev) => {
      this.constructor.setValue(this.icrpgID, parseInt(ev.target.value));
    });

    html.find('.close').click(() => {
      this.constructor.deleteValue(this.icrpgID);
      this.close();
    });
  }

  getRelativePosition() {
    return {
      left: this.position.left / (window.innerWidth - 100),
      top: this.position.top / (window.innerHeight - 100),
    };
  }

  setRelativePosition(position) {
    if (!position) return;
    return this.setPosition({
      left: position.left * (window.innerWidth - 100),
      top: position.top * (window.innerHeight - 100),
    });
  }
}
