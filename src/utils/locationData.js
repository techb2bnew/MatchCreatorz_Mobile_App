const sortByName = (a, b) => a.localeCompare(b);

let countryNamesCache = null;
let countryIsoByNameCache = null;
let countriesData = null;
let statesData = null;

const getCountriesData = () => {
  if (!countriesData) {
    countriesData = require('../data/countries.json');
  }
  return countriesData;
};

const getStatesData = () => {
  if (!statesData) {
    statesData = require('../data/states.json');
  }
  return statesData;
};

const ensureCountryCaches = () => {
  if (countryNamesCache && countryIsoByNameCache) return;

  const countries = getCountriesData();
  countryNamesCache = countries.map(country => country.name).sort(sortByName);
  countryIsoByNameCache = countries.reduce((map, country) => {
    map[country.name] = country.isoCode;
    return map;
  }, {});
};

export const getCountryNames = () => {
  ensureCountryCaches();
  return countryNamesCache;
};

export const DEFAULT_COUNTRY = 'India';

export const getCountryIsoCode = countryName => {
  if (!countryName) return '';
  ensureCountryCaches();
  return countryIsoByNameCache[countryName] || '';
};

export const getStateNamesForCountry = countryName => {
  const countryCode = getCountryIsoCode(countryName);
  if (!countryCode) return [];

  return getStatesData()
    .filter(state => state.countryCode === countryCode)
    .map(state => state.name)
    .sort(sortByName);
};

export const getDefaultStateForCountry = countryName => {
  const stateList = getStateNamesForCountry(countryName);
  if (!stateList.length) return '';

  if (countryName === 'India') {
    const delhi = stateList.find(state => state === 'Delhi');
    if (delhi) return delhi;
  }

  return stateList[0];
};

export const resolveStateForCountry = (countryName, currentState) => {
  const stateList = getStateNamesForCountry(countryName);
  if (!stateList.length) return currentState || '';
  if (stateList.includes(currentState)) return currentState;
  return getDefaultStateForCountry(countryName);
};
