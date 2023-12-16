import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default async () => {
  addCheeseSelector('meditation-room', [
    'combat_cheese',
    'glutter_cheese',
    'susheese_cheese',
  ]);
};
