export function registerFonts() {
  // Fonts
  CONFIG.fontDefinitions['Carlito'] = {
    editor: true,
    fonts: [
      { urls: ['systems/icrpgme/fonts/Carlito.woff2'] },
      { urls: ['systems/icrpgme/fonts/Carlito-Bold.woff2'], weight: 700 },
      { urls: ['systems/icrpgme/fonts/Carlito-Italic.woff2'], style: 'italic' },
      { urls: ['systems/icrpgme/fonts/Carlito-BoldItalic.woff2'], weight: 700, style: 'italic' },
    ],
  };

  CONFIG.fontDefinitions['FlatBread'] = {
    editor: true,
    fonts: [{ urls: ['systems/icrpgme/fonts/FlatBread.woff2'] }],
  };

  CONFIG.fontDefinitions['Nusaliver'] = {
    editor: true,
    fonts: [{ urls: ['systems/icrpgme/fonts/nusaliver.woff2'] }],
  };

  CONFIG.defaultFontFamily = 'Carlito';
}
