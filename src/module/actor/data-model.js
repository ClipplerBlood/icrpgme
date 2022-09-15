// Convenience constructor methods
// Field
const f = foundry.data.fields;
// StringField
const sf = () => new f.StringField({ initial: '' });
// NumberField
const nf = (obj = {}) =>
  new f.NumberField({ ...{ required: true, nullable: false, initial: 0, integer: true }, ...obj });
// BoundedNumberField
const bnf = (m) => nf({ min: -m, max: m });

// AttributeField
const attributef = (m = 6) =>
  new f.SchemaField({
    total: bnf(m),
    base: bnf(m),
    lifeform: bnf(m),
    loot: bnf(m),
  });

export class ICRPGActorDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const schema = {
      description: sf(),
      type: sf(),
      lifeform: sf(),
      world: sf(),
      story: sf(),
      attributes: new f.SchemaField({
        strength: attributef(6),
        dexterity: attributef(6),
        constitution: attributef(6),
        intelligence: attributef(6),
        wisdom: attributef(6),
        charisma: attributef(6),
        defense: attributef(20),
      }),
      effects: new f.SchemaField({
        basic: attributef(9),
        weapons: attributef(9),
        guns: attributef(9),
        energy: attributef(9),
        ultimate: attributef(9),
      }),
      dyingRounds: nf({ min: 0, max: 9 }),
      heroCoin: new f.BooleanField({ required: true, initial: false }),
    };
    return schema;
  }
}
