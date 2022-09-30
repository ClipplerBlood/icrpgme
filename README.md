
<h1 align="center">
  Index Card RPG: Master Edition – Foundry VTT
</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/ClipplerBlood/icrpgme/master/src/assets/world-bg.png" width="256" />
</p>
<p align="center">
  Play ICRPG: Master Edition with a polished UI and a smooth user experience! <br>
  Build your characters in a matter of minutes, using the same character sheets as the paper version! <br>
  Discover the game in the <a href="https://www.runehammer.online/online-store">official Runehammer website</a>.
</p>

## Features
- Easy to use **character & monster sheets** using the same layout as the official paper sheets.
- Easy to use **macros** to speed up play! No more asking "wait, how do I roll this?"
- **Quick character creation**. You don't need huge compendiums of items to build you characters. Simply fill the character with all your LOOTS, and it's done!
- Two modes of usage: players can either fill in their sheets bonuses manually or the GM can create items in advance for players to drag and drop into their characters.
- Custom **combat tracker** and initiative system, respecting the "table order" nature of ICRPG. You can even track obstacles for your encounters
- GM toolbox: **targets and timers**. From the sidebar the GM can quickly create a target or timer for their scenes which will be shared with all other players
- Heaps of **free token images and cards** for your games
- **Custom Foundry skin**, specifically made to match the ICRPG vibes.

## Screenshots

## Installation
To install the system directly from Foundry, search for `Index Card RPG: Master Edition` in the "Install System" section
([official guide](https://foundryvtt.com/article/tutorial/)).

Alternatively you  can install the system directly by copying the manifest link below and pasting it into the manifest link input box:
`https://github.com/ClipplerBlood/icrpgme/releases/latest/download/system.json`

## Strongly suggested & compatible modules:

- [Dice So Nice!](https://foundryvtt.com/packages/dice-so-nice/) 3d dice rolls for your games, giving more importance to the rolls. Also includes a custom ICRPG red dice template
- [Dice Tray](https://foundryvtt.com/packages/dice-calculator): adds shortcuts to quickly roll dice.
- [Combat Chat](https://foundryvtt.com/packages/combat-chat): adds the chat in the combat tracker, so you can have both open at the same time.

## System design choices
This system has been consciously developed with "low automation" in mind. This choice has been motivated by the fact that automation in VTTs more often than not becomes a burden on the GM and players,
with a lot of stuff to configure prior to the game or even during the game.

For example, when making a roll attempt, the target isn't automatically compared against the result to determine its success.
The reason is for play speed: in a game you can have multiple targets (e.g. party split in different scenes) and in game scenes targets can vary very often (e.g. abilities making hard or easy rolls for particular situations).

## Troubleshooting and bug reports
Submit any issues or feature requests [here](https://github.com/ClipplerBlood/icrpgme/issues/new)
Alternatively you also can contact me on discord at ClipplerBlood#8146

## Licensing

This project is being developed under the terms of the
[LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT] for Foundry Virtual Tabletop and the [RUNEHAMMER LICENSE](https://forums.runehammer.online/t/content-creation-regulations/204).

The project is built with permission from the ICRPG creator Brandish Gilhelm (aka Hankerin Ferinale). All assets and designs have permission to be used and published.

Bases, cards and tokens included in this system are part of the free [ICRPG CORE Online Play Assets](https://www.facebook.com/Runehammer.Games/posts/1449015628537373/) bundle.

For developing and redistribution of this project, look at `LICENSE` file for further details.

[League Basic JS Module Template]: https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template
[LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT]: https://foundryvtt.com/article/license/
[Choose an open source license]: https://choosealicense.com/
