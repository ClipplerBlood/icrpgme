export default function ICRPGSheetMixin(DocumentSheetV2Class) {
  return class extends DocumentSheetV2Class {
    static ACTIONS = {};

    static DEFAULT_OPTIONS = {
      actions: {
        toggleEditable: async function (_event, _target) {
          const wasPreviouslyUnlocked = this.locked === false;
          this.locked = !(this.locked ?? true);
          this.window.editSlider?.classList.toggle('locked');

          if (wasPreviouslyUnlocked) {
            await this.submit();
          }
          await this.render();
        },
      },
      form: {
        submitOnChange: true,
      },
    };

    static PARTS_NON_VISIBLE = [];
    static PARTS_NON_EDITABLE = [];

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

    async render(options = {}, _options = {}) {
      this.locked = options?.locked ?? this.locked;
      await super.render(options, _options);

      // Add the locked class to the element
      if (this.locked) {
        this.element.classList.add('locked');
      } else {
        this.element.classList.remove('locked');
      }
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.system = context.document.system;

      // Set the editable states
      this.locked ??= true;
      context.editable = this.isEditable && !this.locked;
      context.readonly = !context.editable;
      context.fields = this.document.system.schema.fields;
      context.isEditable = this.isEditable;
      return context;
    }

    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      // Each part gets also its tab data, if present
      context.tab = context.tabs?.[partId];
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

    async _onRender(context, options) {
      await super._onRender(context, options);
      const html = $(this.element);

      // Discrete selector
      html.find('.icrpg-discrete-selector-v2').click((ev) => {
        const index = $(ev.currentTarget).closest('[data-index]').data('index');
        const target = $(ev.currentTarget).closest('[data-target]').data('target');
        let value = index + 1;
        if (foundry.utils.getProperty(this.document, target) === value) value -= 1;
        this.document.update({ [target]: value });
      });
    }
  };
}
