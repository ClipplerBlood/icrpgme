import ICRPGBaseActorSheetV2 from './actor-sheet-v2.js';
import { onArrayEdit } from '../../utils/utils.js';

export default class ICRPGVehicleSheet extends ICRPGBaseActorSheetV2 {
  static PARTS = {
    sheet: {
      template: 'systems/icrpgme/templates/actor-v2/vehicle/vehicle-sheet.hbs',
      scrollable: [''],
    },
  };

  static DEFAULT_OPTIONS = {
    position: {
      width: 640,
    },
  };

  async _onRender(context, options) {
    super._onRender(context, options);

    // Vehicle chunks edit
    const html = $(this.element);
    html
      .find('.edit[data-action-group="chunks"] input, .edit[data-action-group="chunks"] textarea')
      .on('change', (ev) => {
        const ct = $(ev.currentTarget);
        const index = ct.closest('[data-chunk-index]').data('chunkIndex');
        const defaultEntryConstructor = (val) => ({
          name: val,
          description: '',
          health: { hearts: 1, max: 10, damage: 0, value: 10 },
        });
        const update = onArrayEdit(this.actor.system.chunks, ev, index, defaultEntryConstructor);
        this.actor.update({ 'system.chunks': update });
      });

    // Chunk Hearts selector
    // Toggles between 1 heart and half
    html.find('.edit[data-action-group="chunks"] .icrpg-heart').click((ev) => {
      const chunkIndex = $(ev.currentTarget).closest('[data-chunk-index]').data('chunkIndex');
      const chunks = this.actor.system.chunks;
      const currentHearts = chunks[chunkIndex].health.hearts;
      chunks[chunkIndex].health.hearts = currentHearts === 1 ? 0.5 : 1;
      this.actor.update({ 'system.chunks': chunks });
    });

    // Vehicle Maneuvers edit
    html
      .find('.edit[data-action-group="maneuvers"] input, .edit[data-action-group="maneuvers"] textarea')
      .on('change', (ev) => {
        const ct = $(ev.currentTarget);
        const index = ct.closest('[data-action-index]').data('actionIndex');
        const update = onArrayEdit(this.actor.system.maneuvers, ev, index);
        this.actor.update({ 'system.maneuvers': update });
      });
  }
}
