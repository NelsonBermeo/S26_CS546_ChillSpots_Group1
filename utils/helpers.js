import {
  addLocation,
  getLocationById,
  updateLocation,
  getAllLocations,
  getLocationsByTag,
  getLocationsByName,
  getLocationsByZip
} from '../data/locations.js';

import {
  checkId,
  checkString,
  checkStringArray,
  checkNumericString,
  check_length
} from '../validation.js';

import xss from 'xss';

export const queryFilteredLocs = async (query) => {
    let locations = [];

    if (query.name) {
        const name = checkString(xss(query.name), 'name');
        locations = await getLocationsByName(name);
    } else if (query.zipcode) {
        const zipcode = checkNumericString(xss(query.zipcode), 'zipcode');
        locations = await getLocationsByZip(zipcode);
    } else if (query.tags) {
        const tags = parseTags(query.tags);
        locations = await getLocationsByTag(tags);
    } else {
        locations = await getAllLocations();
    }
    return locations;
}