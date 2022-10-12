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
      height: this.height,
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
    this.element.css({ height: this.constructor.height + 'px', width: this.constructor.width + 'px' });
    // Dodge escape-close
    delete ui.windows[this.appId];
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Dragging
    const handle = html.find('.drag-handle').get(0);
    const draggable = new Draggable(this, this.element, handle, false);
    draggable._onDragMouseUp = (event) => {
      // Call the default function, then save the position to the storage
      Draggable.prototype._onDragMouseUp.call(draggable, event);
      // this.constructor.setStoredData(this.icrpgID, {
      //   position: this.getRelativePosition(),
      // });
    };
    draggable._onDragMouseMove = (event) => this._onDragMouseMove(event, draggable);

    if (!game.user.isGM) return;
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
    // Get the relative position and compute the absolute
    if (!relativePosition) return;
    let pos = rectRelToAbs(relativePosition);

    // Find overlaps, and if so, compute new position
    const overlappingRect = this.getOverlappingRect(pos);
    if (overlappingRect) {
      pos = findNewPos(pos, overlappingRect);
    }

    // Even if no overlaps, limit the relative position to the inner bounds
    pos.left = Math.min(pos.left, window.innerWidth - pos.width - 320);
    pos.top = Math.min(pos.top, window.innerHeight - pos.height);
    this.setPosition({ left: pos.left, top: pos.top });
  }

  getOverlappingRect(r1 = undefined, includeSidebar = true) {
    r1 = r1 ?? this.position;
    // Loop through all the open apps, checking for intersections
    for (const [id, app] of game.icrpgme.apps) {
      if (id === this.icrpgID) continue;
      const r2 = app.position;
      r2.height = app.element.height();
      r2.width = app.element.width();
      if (intersectRect(r1, r2)) return r2;
    }

    // Include sidebar in the overlaps
    if (includeSidebar) {
      const sidebarRect = {
        top: 0,
        height: window.innerHeight,
        left: window.innerWidth - 300,
        width: 300,
      };
      if (intersectRectX(r1, sidebarRect)) return sidebarRect;
    }
    return undefined;
  }

  _onDragMouseMove(event, draggable) {
    event.preventDefault();

    // Limit dragging to 60 updates per second
    const now = Date.now();
    if (now - this._moveTime < 1000 / 60) return;
    this._moveTime = now;

    // Update application position
    let position = {
      left: draggable.position.left + (event.clientX - draggable._initial.x),
      top: draggable.position.top + (event.clientY - draggable._initial.y),
    };

    // Set the current position
    this.setPosition(position);
    position.width = this.element.width();
    position.height = this.element.height();

    // Check collision
    const overlappingRect = this.getOverlappingRect();
    if (overlappingRect) {
      position = findNewPos(this.position, overlappingRect);
      delete position.width;
      delete position.height;
      this.setPosition(position);
    }

    // // Emit the change
    // game.socket.emit('system.icrpgme', {
    //   icrpgID: this.icrpgID,
    //   action: 'position',
    //   className: this.name,
    //   position: this.getRelativePosition(),
    // });
  }
}

function intersectRect(r1, r2) {
  return intersectRectX(r1, r2) && intersectRectY(r1, r2);
}

function intersectRectX(r1, r2) {
  return r1.left <= r2.left + r2.width && r2.left <= r1.left + r1.width;
}

function intersectRectY(r1, r2) {
  return r1.top <= r2.top + r2.height && r2.top <= r1.top + r1.height;
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

function findNewPos(r1, r2) {
  // Compute the distances from the centers
  const distX = (r1.left + r1.width) / 2 - (r2.left + r2.width) / 2;
  const distY = (r1.top + r1.height) / 2 - (r2.top + r2.height) / 2;
  const newRect = { ...r1 };

  // Select which axis to focus
  if (Math.abs(distX) >= Math.abs(distY)) {
    if (distX < 0) {
      newRect.left = r2.left - r1.width;
    } else {
      newRect.left = r2.left + r2.width;
    }
  } else {
    if (distY < 0) {
      newRect.top = r2.top - r1.height;
    } else {
      newRect.top = r2.top + r2.height;
    }
  }

  // If going above the window, set it below the other rect
  if (newRect.top <= 0) {
    newRect.top = r2.top + r2.height;
  }
  // If going below the window, set it above the other rect & recompute X
  if (newRect.top + newRect.height >= window.innerHeight) {
    newRect.top = r1.top;
    if (distX < 0) {
      newRect.left = r2.left - r1.width;
    } else {
      newRect.left = r2.left + r2.width;
    }
  }

  // If going left of the window, set it at the right of the other rect
  if (newRect.left <= 0) {
    newRect.left = r2.left + r2.width;
  }
  // If the new rect X intercepts the sidebar zone, limit it
  if (newRect.left + newRect.width >= window.innerWidth - 320) {
    newRect.left = window.innerWidth - 320 - r1.width;
    newRect.top = r1.top;
  }

  return newRect;
}
