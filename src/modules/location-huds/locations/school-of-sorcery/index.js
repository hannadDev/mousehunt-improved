import { addHudStyles, getSetting } from '@utils';

import cleanChalkboard from './clean-chalkboard.css';
import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([
    regionStyles,
    styles,
    getSetting('location-huds.school-of-sorcery-clean-chalkboard', false) && cleanChalkboard,
  ]);
};
