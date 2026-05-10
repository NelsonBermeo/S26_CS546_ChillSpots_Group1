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
        console.log("Name route");
    } else if (query.zipcode) {
        const zipcode = checkNumericString(xss(query.zipcode), 'zipcode');
        locations = await getLocationsByZip(zipcode);
        console.log("zipcode route");
    } else if (query.tags) {
        const tags = parseTags(query.tags);
        locations = await getLocationsByTag(tags);
        console.log("tag route");
    } else {
        locations = await getAllLocations();
        console.log("all route");
    }
    return locations;
}