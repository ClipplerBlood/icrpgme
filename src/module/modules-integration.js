export function integrateExternalModules() {
  Hooks.once('diceSoNiceReady', initDiceSoNice);
}

function initDiceSoNice(dice3d) {
  dice3d.addSystem({ id: 'icrpgme', name: 'Index Card RPG: Master Edition' }, true);
  dice3d.addColorset({
    name: 'Index Card RPG: Master Edition',
    category: 'System',
    description: 'ICRPG',
    foreground: '#ffffff',
    background: '#C02025FF',
    outline: '#C02025FF',
    material: 'plastic',
    font: 'Arial',
    default: true,
  });
}

Hooks.once('<<<diceSoNiceReady>>>', (dice3d) => {
  dice3d.addSystem({ id: 'demonlord', name: 'Demonlord' }, true);
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/demonlord/assets/ui/icons/logo.png'],
    system: 'demonlord',
  });
  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      'systems/demonlord/assets/ui/icons/logo.png',
    ],
    system: 'demonlord',
  });
  dice3d.addColorset({
    name: 'demonlord',
    description: 'Special',
    category: 'Demonlord',
    foreground: '#d0d0d0',
    background: '#651510',
    outline: '#651510',
    texture: 'marble',
    material: 'metal',
    font: 'Luminari',
    default: true,
  });
});
