import type { Schema, Struct } from '@strapi/strapi';

export interface GameHonor extends Struct.ComponentSchema {
  collectionName: 'components_game_honors';
  info: {
    description: 'Awards and honors for games';
    displayName: 'Honor';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    organization: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<
      ['Winner', 'Nominee', 'Honorable Mention', 'Special Award']
    > &
      Schema.Attribute.DefaultTo<'Winner'>;
    year: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 2030;
          min: 1900;
        },
        number
      >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'game.honor': GameHonor;
    }
  }
}
