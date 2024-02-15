import {
  addStyles,
  doRequest,
  getCurrentLocation,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  saveSetting
} from '@utils';

import journals from './journals.json';

import settings from './settings';
import styles from './styles.css';

let themes = [];

const getJournalThemes = async () => {
  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'get_themes',
  });

  if (! req.journal_themes) {
    return [];
  }

  return req.journal_themes.theme_list.filter((theme) => theme.can_equip === true);
};

const updateJournalTheme = async (theme) => {
  const current = getCurrentJournalTheme();

  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'set_theme',
    theme,
  });

  if (req.success) {
    // remove the old theme and add the new one
    const journal = document.querySelector('#journalContainer');
    if (journal) {
      journal.classList.remove(current);
      journal.classList.add(theme);
    }
  }

  return req;
};

const getCurrentJournalTheme = () => {
  const journal = document.querySelector('#journalContainer');
  if (! journal) {
    return false;
  }

  return [...journal.classList].find((cls) => cls.startsWith('theme_'));
};

const getJournalThemeForLocation = () => {
  const location = getCurrentLocation();
  const journalTheme = journals.find((j) => j.environments.includes(location));
  if (! journalTheme) {
    return false;
  }

  // check if the theme is available
  if (themes.some((t) => t.type === journalTheme.type)) {
    return journalTheme.type;
  }

  return journalTheme.type;
};

const changeForLocation = async () => {
  if (themes.length === 0) {
    themes = await getJournalThemes();
  }

  const newTheme = getJournalThemeForLocation();
  if (! newTheme) {
    return;
  }

  const currentTheme = getCurrentJournalTheme();
  if (! currentTheme) {
    return;
  }

  // check if we even have the theme
  if (! themes.some((t) => t.type === newTheme)) {
    return;
  }

  if (currentTheme === newTheme) {
    return;
  }

  // Set the new theme.
  updateJournalTheme(newTheme);

  const journal = document.querySelector('#journalContainer');
  if (journal) {
    journal.classList.remove(currentTheme);
    journal.classList.add(newTheme);
  }
};

const randomizeTheme = async () => {
  if (themes.length === 0) {
    themes = await getJournalThemes();
  }

  const theme = themes[Math.floor(Math.random() * themes.length)];
  updateJournalTheme(theme.type);
};

const addRandomButton = () => {
  const journal = document.querySelector('#journalContainer .top');
  if (! journal) {
    return;
  }

  const button = makeElement('a', ['journalContainer-selectTheme', 'mh-improved-random-journal'], 'Randomize');
  button.addEventListener('click', randomizeTheme);

  journal.append(button);
};
const changeJournalDaily = () => {
  const lastChangeValue = getSetting('journal-changer-last-change', '0');
  const lastChange = new Date(Number.parseInt(lastChangeValue, 10));
  const now = new Date();

  // Check if the current time is past midnight and the journal has not been changed today
  if (
    ! lastChange ||
    lastChange.getDate() !== now.getDate() ||
    lastChange.getMonth() !== now.getMonth() ||
    lastChange.getFullYear() !== now.getFullYear()
  ) {
    randomizeTheme();
    saveSetting('journal-changer-last-change', now.getTime());
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'journal-changer');

  if (getSetting('journal-changer-change-daily', false)) {
    changeJournalDaily();
  }

  if (getSetting('journal-changer-change-location', true)) {
    changeForLocation();
    onEvent('travel_complete', changeForLocation);
  }

  onNavigation(addRandomButton, {
    page: 'camp'
  });
};

export default {
  id: 'journal-changer',
  name: 'Journal Theme Changer',
  type: 'feature',
  default: false,
  description: '',
  load: init,
  settings,
};
