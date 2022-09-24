/**
 * Inspiration for the code taken from the original ICRPG system
 * https://github.com/jessev14/FoundryVTT-ICRPG/blob/master/module/apps/globalDC.js
 */
export class ICRPGBaseApp extends Application {
  static async setStoredData(id, data, options = { emit: true }) {
    const storedAppData = game.settings.get('icrpgme', 'appData');
    const isCreate = !(id in storedAppData);
    storedAppData[id] = mergeObject(storedAppData[id] ?? {}, expandObject(data));
    await game.settings.set('icrpgme', 'appData', storedAppData);
    if (options.emit) {
      // eslint-disable-next-line no-undef
      if (isCreate)
        game.socket.emit('system.icrpgme', {
          icrpgID: id,
          action: 'create',
          className: this.name,
          value: data,
        });
      else
        game.socket.emit('system.icrpgme', {
          icrpgID: id,
          action: 'change',
          className: this.name,
          value: data,
        });
    }
    return data;
  }

  static getStoredData(id) {
    return game.settings.get('icrpgme', 'appData')[id];
  }

  static async deleteStoredData(id, options = { emit: true }) {
    const storedAppData = game.settings.get('icrpgme', 'appData');
    delete storedAppData[id];
    await game.settings.set('icrpgme', 'appData', storedAppData);
    if (options.emit)
      game.socket.emit('system.icrpgme', {
        icrpgID: id,
        action: 'close',
      });
    return id;
  }

  // ----------------------------------------------

  static async defaultValue() {
    return undefined;
  }

  static async create(icrpgID, callerID) {
    // Create a new application
    const app = new this();
    app.icrpgID = icrpgID;

    // If caller (gm) store the app in the settings and emit creation event
    if (game.userId === callerID) {
      await this.setStoredData(icrpgID, {
        className: this.name,
        value: await this.defaultValue(),
      });
    }

    // Get the stored position, render and then set it
    const storedPosition = this.getStoredData(icrpgID)?.position;
    await app._render(true);
    await app.setRelativePosition(storedPosition);

    // Store the application in the client-side storage
    console.assert(!game.icrpgme.apps.has(icrpgID), "App's icrpgID already present");
    game.icrpgme.apps.set(icrpgID, app);

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
      classes: ['icrpg-app'],
      title: 'ICRPG APP', // Needed otherwise it can break
      width: this.width,
      height: this.width,
    });
  }

  static get width() {
    return 200;
  }

  static get height() {
    return 200;
  }
  async getData() {
    const content = super.getData();
    content.value = this.constructor.getStoredData(this.icrpgID)?.value ?? this.constructor.defaultValue();
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
    const handle = html.find('.drag-handle').get(0);
    const defaultOptions = this.constructor.defaultOptions;
    const draggable = new Draggable(this, html, handle, false);
    draggable._onDragMouseUp = (event) => {
      Draggable.prototype._onDragMouseUp.call(draggable, event);
      this.constructor.setStoredData(this.icrpgID, {
        position: this.getRelativePosition(),
      });
    };
    draggable._onDragMouseMove = (event) => {
      event.preventDefault();

      // Limit dragging to 30 updates per second
      const now = Date.now();
      if (now - this._moveTime < 1000 / 60) return;
      this._moveTime = now;

      // Update application position

      const position = {
        left: draggable.position.left + (event.clientX - draggable._initial.x),
        top: draggable.position.top + (event.clientY - draggable._initial.y),
        width: defaultOptions.width,
        height: defaultOptions.height,
      };

      console.log(draggable._initial, position, event.clientX, event.clientY, this.position.left);
      if (this.isColliding(position)) return;
      delete position.width;
      delete position.height;
      this.setPosition(position);

      game.socket.emit('system.icrpgme', {
        icrpgID: this.icrpgID,
        action: 'position',
        className: this.name,
        position: this.getRelativePosition(),
      });
    };

    html.find('.close').click(() => {
      this.constructor.deleteStoredData(this.icrpgID);
      game.icrpgme.apps.delete(this.icrpgID);
      this.close();
    });
  }

  getRelativePosition() {
    const pos = this.position;
    return rectAbsToRel(pos);
  }

  setRelativePosition(relativePosition) {
    if (!relativePosition) return;
    let pos = duplicate(relativePosition);
    pos = rectRelToAbs(pos);
    if (this.isColliding(pos)) return;

    pos.left = Math.min(pos.left, window.innerWidth - pos.width - 320);
    pos.top = Math.min(pos.top, window.innerHeight - pos.height - 120);
    this.setPosition({ left: pos.left, top: pos.top });
  }

  isColliding(r1 = undefined) {
    return false;
    r1 = r1 ?? this.position;
    for (const [id, app] of game.icrpgme.apps) {
      if (id === this.icrpgID) continue;
      const r2 = app.position;
      if (intersectRect(r1, r2)) return true;
    }
    return false;
  }
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.left + r1.width ||
    r2.left + r2.width < r1.left ||
    r2.top > r1.top + r1.height ||
    r2.top + r2.height < r1.top
  );
}

function rectAbsToRel(rect) {
  return {
    top: rect.top / window.innerHeight,
    left: rect.left / window.innerWidth,
    height: rect.height,
    width: rect.width,
  };
}

function rectRelToAbs(rect) {
  return {
    top: rect.top * window.innerHeight,
    left: rect.left * window.innerWidth,
    height: rect.height,
    width: rect.width,
  };
}
