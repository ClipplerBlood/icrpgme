const TextEditor = foundry.applications.ux.TextEditor.implementation;

export default class EncounterEntryPage extends foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet {
  static DEFAULT_OPTIONS = {
    classes: ['icrpg-encounter-page'],
    viewClasses: ['icrpg-encounter-page'],
    includeTOC: false,
    position: {
      width: 550,
      height: 'auto',
    },
    window: {
      contentClasses: ['standard-form'],
      resizable: true,
    },
    form: {
      closeOnSubmit: false,
    },
  };

  static EDIT_PARTS = {
    header: super.EDIT_PARTS.header,
    tabs: { template: 'templates/generic/tab-navigation.hbs' },
    content: {
      template: 'systems/icrpgme/templates/journal/encounter-edit.hbs',
    },
    description: {
      template: 'systems/icrpgme/templates/journal/encounter-edit-description.hbs',
    },
    footer: super.EDIT_PARTS.footer,
  };

  static TABS = {
    sheet: {
      tabs: [
        { id: 'content', icon: 'fa-solid fa-memo-pad', label: 'ICRPG.journal.roomDesign' },
        { id: 'description', icon: 'fas fa-align-left', label: 'Description' },
      ],
      initial: 'content',
    },
  };

  static VIEW_PARTS = {
    content: {
      template: 'systems/icrpgme/templates/journal/encounter-view.hbs',
      root: true,
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.fields = {
      ...(context.fields ?? {}),
      ...(this.document?.system?.schema?.fields ?? {}),
    };
    context.system = this.document?.system;
    context.text = this.document.text;
    if (this.isView)
      context.text.enriched = await TextEditor.implementation.enrichHTML(context.text.content, {
        relativeTo: this.page,
        secrets: this.page.isOwner,
      });
    return context;
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    const tab = context.tabs[partId];
    if (tab) {
      context.tab = tab;
      const tabContext = await this[`_prepare${partId.titleCase()}Tab`]?.();
      Object.assign(context, tabContext ?? {});
    }
    return context;
  }
}
