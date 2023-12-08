import environments from '@data/environments.json';

import { getArForMouse, makeElement, mapper } from '@/utils';

const getMapData = (mapId = false, strict = false) => {
  if (mapId !== false) {
    const sessionMap = JSON.parse(sessionStorage.getItem(`mh-improved-map-cache-${mapId}`));
    if (sessionMap) {
      return sessionMap;
    }
  }

  if (strict) {
    return false;
  }

  const localStorageMap = JSON.parse(sessionStorage.getItem('mh-improved-map-cache-last-map'));
  if (localStorageMap) {
    return localStorageMap;
  }

  return false;
};

const setMapData = (mapId, mapData) => {
  sessionStorage.setItem(`mh-improved-map-cache-${mapId}`, JSON.stringify(mapData));
  sessionStorage.setItem('mh-improved-map-cache-last-map', JSON.stringify(mapData));
};

const addBlockClasses = () => {
  const rightBlocks = document.querySelectorAll('.treasureMapView-rightBlock > div');
  const leftBlocks = document.querySelectorAll('.treasureMapView-leftBlock > div');
  const blocks = [...rightBlocks, ...leftBlocks];

  let prevBlockType = '';
  blocks.forEach((block) => {
    if (block.classList.contains('treasureMapView-block-title')) {
      const blockType = block.innerText
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll(/[^a-z-]/g, '')
        .replace('--', '-')
        .replace('goalssearch', 'goals');
      block.classList.add(`mh-ui-${blockType}-title`);
      prevBlockType = blockType;
    } else {
      block.classList.add(`mh-ui-${prevBlockType}-block`);
    }
  });
};

const addMHCTData = async (mouse, appendTo, type = 'mouse') => {
  const existingMhct = appendTo.querySelector(`#mhct-${mouse.unique_id}-${type}`);
  if (existingMhct) {
    return;
  }

  const mhctjson = await getArForMouse(mouse.unique_id, type);

  const mhctDiv = makeElement('div', 'mhct-data');
  mhctDiv.id = `mhct-${mouse.unique_id}-${type}`;

  const header = makeElement('div', 'mhct-title');
  makeElement('span', 'mhct-title-text', 'item' === type ? 'Drop Rates' : 'Attraction Rates', header);
  const mhctLink = makeElement('a', 'mhct-link', 'View on MHCT →');
  mhctLink.target = '_mhct';

  if (! mouse.name) {
    const nameEl = document.querySelector('.treasureMapView-highlight-name');
    mouse.name = nameEl ? nameEl.innerText : mouse.unique_id;
  }

  mhctLink.href = 'item' === type ? `https://www.mhct.win/loot.php?item=${mouse.unique_id}` : `https://www.mhct.win/attractions.php?mouse_name=${mouse.name}`;

  header.append(mhctLink);
  mhctDiv.append(header);

  if (! mhctjson.slice) {
    return;
  }

  const amountOfLocationsToShow = 5; // TODO: maybe modify this for some mice or make it an option?
  mhctjson.slice(0, amountOfLocationsToShow).forEach((mhct) => {
    const mhctRow = makeElement('div', 'mhct-row');
    const location = makeElement('div', 'mhct-location');

    makeElement('span', 'mhct-location-text', mhct.location, location);

    if (mhct.stage) {
      makeElement('span', 'mhct-stage', mhct.stage, location);
    }

    const environment = environments.find((env) => {
      return env.name === mhct.location;
    });

    if (! environment) {
      mhctRow.classList.add('mhct-row-no-env');
    }

    mhctRow.append(location);

    makeElement('div', 'mhct-bait', mhct.cheese, mhctRow);

    const mhctRate = Number.parseInt('item' === type ? mhct.drop_pct : mhct.rate / 100, 10).toFixed(1);
    makeElement('div', 'mhct-rate', `${mhctRate}%`, mhctRow);

    mhctRow.addEventListener('click', () => {
      // if we're in the right location, then equip the right cheese, otherwise show the travel dialog)
      if (environment.id === getCurrentLocation()) {
        app.pages.CampPage.toggleItemBrowser('bait');
        jsDialog().hide();
        return;
      }

      const travelEnvironment = mapper('mapData').environments.find((env) => {
        return env.type === environment.id;
      });

      showTravelConfirmation(travelEnvironment, mapModel());
    });

    mhctDiv.append(mhctRow);
  });

  // if the rows were empty, then add a message
  if (0 === mhctjson.length) {
    const mhctRow = makeElement('div', 'mhct-row');
    makeElement('div', 'mhct-no-data', 'No data available', mhctRow);
    mhctDiv.append(mhctRow);
  }

  appendTo.append(mhctDiv);
};

export {
  addBlockClasses,
  getMapData,
  setMapData,
  addMHCTData
};
