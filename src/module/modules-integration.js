export function integrateExternalModules() {
  Hooks.once('diceSoNiceReady', initDiceSoNice);
}

function initDiceSoNice(dice3d) {
  dice3d.addSystem({ id: 'icrpgme', name: 'Index Card RPG: Master Edition' }, 'preferred');
  dice3d.addColorset(
    {
      name: 'Index Card RPG: Master Edition',
      category: 'System',
      description: 'ICRPG',
      foreground: '#ffffff',
      background: '#C02025FF',
      outline: '#C02025FF',
      // edge: '#202020',
      material: 'plastic',
      font: 'Arial',
      default: true,
    },
    'preferred',
  );
}
