## [1.2.1] UI Improvements 📖
- Styled the **TOKEN NAMEPLATE**.
- Added **FLOATING TEXT**. A notification over the token is displayed when
  - Hero coin is added or used
  - The character dying counter is updated
  - A resource is updated
  - An item state changes (equipped or carried)
  - An item is added or removed
  - A power's mastery is updated
- Increased the readability of the character sheet loot tab.
- UI tweaks in the character sheet.
- When the sheet is locked, hovering on a not editable resource doesn't color the text red.
- Fixed spells' levels not accepting numbers different from 1.
- Right-clicking on an item shows the delete option even if the sheet is locked.
- Improved the **DiceSoNice** preset, with bigger and bolder numbers.
- Added a **SETTING** to show or hide the "Sheet" header button in actor and item sheets. Useful if you want to use 3rd party sheets.


## [1.2.0] Spells and Powers 🪄🦸
- Added **SPELL** item type! Spells are Loots that have additional information such as level, type, duration, target and flavor text.
- Added **FILTERS**. In the character sheet loot section, you can press a button to toggle between spells only, loot only and loot + spells.
- Improved the **POWER** item type! Powers now have customizable SP costs and a mastery counter each.
- Monster actions and vehicle maneuvers are now clickable. When clicking on the action name, the action gets posted to chat.
- Fixed issue with item bonuses not calculating correctly
- Defense now is capped to 20
- Roll table results now correctly display the dice roll
- Added setting that enables **Target & Timer background** to increase their legibility in dark scenes.
- Added current equipped and carried **WEIGHT** in the locked character sheet view.
- Now the sheet doesn't minimize when rapidly clicking on the sheet lock button.

## [1.1.1] Hotfix
- Fixed error when combat tracker was empty

## [1.1.0] Vehicles and Resources update 🏎️🛩️
- Added **vehicle actor type** with custom sheet. Vehicle chunks HP can be edited directly in the Combat Tracker
- Added **resource tracking** in Combat Tracker. You can now edit resources such as Mastery, SP or custom ones directly from the tracker.
- Characters and monsters now can have **half heart increments**.
- Switched position of notes and resources tabs in character sheet
- Minor style changes
- Fixed refCount error when loading the game

## [1.0.0] First release!
