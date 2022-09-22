import { requestRollDialog } from '../dialog/roll-dialogs.js';

export function rollSelected(rollGroup, rollName, mod = 0, showDialog = false) {
  const selectedActors = game.canvas.tokens.controlled.map((t) => t.actor);
  if (showDialog) {
    selectedActors.forEach((actor) => requestRollDialog(actor, rollName, rollGroup, { initialMod: mod }));
  } else {
    selectedActors.forEach((actor) => actor.roll(rollName, rollGroup, { mod: mod }));
  }
}
