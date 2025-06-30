const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ICRPGBaseSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static ACTIONS = {};

  static DEFAULT_OPTIONS = {
    actions: {
      toggleEditable: ICRPGBaseSheet.toggleEditable,
    },
    form: {
      submitOnChange: true,
    },
  };

  static PARTS_NON_VISIBLE = [];
  static PARTS_NON_EDITABLE = [];

  static async toggleEditable(_event, _target) {
    const wasPreviouslyUnlocked = this.locked === false;
    this.locked = !(this.locked ?? true);
    this.window.editSlider?.classList.toggle('locked');

    if (wasPreviouslyUnlocked) {
      await this.submit();
    }
    this.render();
  }

  async _renderFrame(options) {
    this.locked ??= true;
    const frame = await super._renderFrame(options);

    // If editable, add the slider
    if (this.isEditable) {
      let slider = `
      <div class="slide-toggle-track ${this.locked ? 'locked' : ''}"
           data-action="toggleEditable"
           data-tooltip="ICRPG.lockUnlock">
        <div class="slide-toggle-thumb"></div>
      </div>
    `;
      this.window.title.insertAdjacentHTML('beforebegin', slider);
      this.window.editSlider = this.window.header.querySelector('.slide-toggle-track');
    }

    // Hide the title if not minimized
    if (!this.minimized) this.window.title.style.display = 'none';
    return frame;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = context.document.system;

    // Set the editable states
    this.locked ??= true;
    context.editable = this.isEditable && !this.locked;
    context.readonly = !context.editable;
    return context;
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    // Each part gets also its tab data, if present
    context.tab = context.tabs[partId];
    return context;
  }

  async close(options = {}) {
    // Prevent closing if the sheet is unlocked
    if (!this.locked) await this.submit();
    return await super.close(options);
  }

  async minimize() {
    await super.minimize();
    this.window.title.style.display = 'block';
    $(this.window.editSlider).css('display', 'none');
  }

  async maximize() {
    await super.maximize();
    this.window.title.style.display = 'none';
    $(this.window.editSlider).css('display', 'flex');
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    // Hide parts for users that do not have view permissions
    if (!this.isVisible) {
      options.parts = options.parts.filter(
        (part) =>
          !this.constructor.PARTS_NON_VISIBLE.includes(part) && !this.constructor.PARTS_NON_EDITABLE.includes(part),
      );
    }

    // Hide parts for users that do not have edit permissions
    if (!this.isEditable) {
      options.parts = options.parts.filter((part) => !this.constructor.PARTS_NON_EDITABLE.includes(part));
    }
  }
}
