import {
  addStyles,
  getCurrentPage,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  onOverlayChange
} from '@utils';

import recipes from './recipes';
import settings from './settings';

import fullWidthStyles from './full-width-item.css';
import styles from './styles.css';

const setOpenQuantityOnClick = (attempts = 0) => {
  const qty = document.querySelector('.itemView-action-convertForm');
  if (! qty) {
    if (attempts > 10) {
      return;
    }

    setTimeout(() => {
      setOpenQuantityOnClick(attempts + 1);
    }, 200);
    return;
  }

  qty.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
      const textQty = e.target.innerText;
      const qtyArray = textQty.split(' ');
      let maxNum = qtyArray.at(-1);
      maxNum = maxNum.replace('Submit', '');
      maxNum = Number.parseInt(maxNum);

      const input = document.querySelector('.itemView-action-convert-quantity');
      input.value = maxNum;
    }
  });
};

const addOpenAlltoConvertible = () => {
  const form = document.querySelector('.convertible .itemView-action-convertForm');
  if (! form) {
    return;
  }

  if (form.getAttribute('data-open-all-added')) {
    return;
  }

  form.setAttribute('data-open-all-added', true);

  // get the innerHTML and split it on the input tag. then wrap the second match in a span so we can target it
  const formHTML = form.innerHTML;
  const formHTMLArray = formHTML.split(' /');
  // if we dont have a second match, just return
  if (! formHTMLArray[1]) {
    return;
  }

  const formHTMLArray2 = formHTMLArray[1].split('<a');
  if (! formHTMLArray2[1]) {
    return;
  }

  const quantity = formHTMLArray2[0].trim();

  const newFormHTML = `${formHTMLArray[0]}/ <span class="open-all">${quantity}</span><a${formHTMLArray2[1]}`;
  form.innerHTML = newFormHTML;

  const openAll = document.querySelector('.open-all');
  openAll.addEventListener('click', () => {
    const input = form.querySelector('.itemView-action-convert-quantity');
    if (! input) {
      return;
    }

    input.value = quantity;
  });
};

const addItemViewPopupToCollectibles = () => {
  const collectibles = document.querySelectorAll('.mousehuntHud-page-subTabContent.collectible .inventoryPage-item.small');
  if (! collectibles.length) {
    return;
  }

  collectibles.forEach((collectible) => {
    const type = collectible.getAttribute('data-item-type');
    if (! type) {
      return;
    }

    if ('message_item' === collectible.getAttribute('data-item-classification')) {
      return;
    }

    collectible.setAttribute('onclick', '');
    collectible.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.ItemView.show(type);
    });
  });
};

const addArmButtonToCharms = () => {
  const charms = document.querySelectorAll('.inventoryPage-item.trinket');
  if (! charms.length) {
    return;
  }

  charms.forEach((charm) => {
    // If it already has an arm button, skip it.
    const existingArmButton = charm.querySelector('.inventoryPage-item-imageContainer-action');
    if (existingArmButton) {
      return;
    }

    const actionContainer = charm.querySelector('.inventoryPage-item-imageContainer');
    if (! actionContainer) {
      return;
    }

    const armButton = makeElement('div', 'inventoryPage-item-imageContainer-action');
    armButton.setAttribute('onclick', 'app.pages.InventoryPage.armItem(this); return false;');

    actionContainer.append(armButton);
  });
};

const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  addOpenAlltoConvertible();
  addItemViewPopupToCollectibles();
  addArmButtonToCharms();

  onNavigation(() => {
    addOpenAlltoConvertible();
    addItemViewPopupToCollectibles();
    addArmButtonToCharms();
  }, {
    page: 'inventory',
  });

  onEvent('js_dialog_show', addOpenAlltoConvertible);

  recipes();
};

const maybeAddFullWidthStyles = () => {
  const isFullWidth = getSetting('better-inventory-one-item-per-row', true);
  return isFullWidth ? fullWidthStyles : '';
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    styles,
    maybeAddFullWidthStyles()
  ]);

  main();
};

export default {
  id: 'better-inventory',
  name: 'Better Inventory',
  type: 'better',
  default: true,
  description: 'Updates the inventory layout and styling. ',
  load: init,
  settings
};
