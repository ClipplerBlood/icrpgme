export default class ICRPGJournalEntrySheet extends foundry.applications.sheets.journal.JournalEntrySheet {
  static PARTS = {
    sidebar: {
      template: 'systems/icrpgme/templates/journal/journal-sidebar.hbs',
      templates: ['templates/journal/toc.hbs'],
      scrollable: ['.toc'],
    },
    pages: {
      template: 'systems/icrpgme/templates/journal/journal-pages.hbs',
      scrollable: ['.journal-entry-pages'],
    },
  };
}
