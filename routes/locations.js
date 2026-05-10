import {Router} from 'express';
import xss from 'xss';
import {
  checkId,
  checkString,
  checkStringArray,
  checkNumericString,
  check_length
} from '../validation.js';
import {middleware} from '../middleware/auth.js';

import {
  addLocation,
  getLocationById,
  updateLocation,
  getAllLocations,
  getLocationsByTag,
  getLocationsByName,
  getLocationsByZip
} from '../data/locations.js';
import * as reports from '../data/reports.js';
const router = Router();

/*
TODO:
-auth/login must store req.session.member._id because this file uses current middleware/auth.js session setup
-I think location.handlebars form action should be changed from /review/{{_id}} to /locations/{{_id}}/reviews
-I took a look at data/locations.js, it still needs a few additions/fixes:
  -removeLocation(locationId) is empty
  -addLocation sets lat from coordinates.lng instead of coordinates.lat
  -average_saftey_rating is misspelled
-data/reviews.js needs getReviewsByLocationId(locationId) so location detail pages can render full review objects
-data/reviews.js needs addReview(userId, locationId, content, safetyRating) before POST /:id/reviews fully works
-data/users.js or data/locations.js needs markLocationVisited(userId, locationId)
*/

//renders a temporary "Not Implemented" error page for unfinished route functionality
const notImplemented = (res, todo) => {
  return res.status(501).render('error', {
    title: 'Not Implemented',
    error: todo
  });
};

//sanitizes, normalizes, and validates location tags from form/query input
const parseTags = (rawTags) => {
  if (!rawTags) return [];

  let tags = rawTags;

  if (!Array.isArray(tags)) {
    tags = tags.split(',').map((tag) => tag.trim());
  }

  tags = tags.map((tag) => xss(tag).toLowerCase());

  return checkStringArray(tags, 'tags');
};

//renders the main locations browse/search page
router
  .route('/')
  .get(async (req, res) => {
    try {
      let locations = [];

      if (req.query.name) {
        const name = checkString(xss(req.query.name), 'name');
        locations = await getLocationsByName(name);
      } else if (req.query.zipcode) {
        const zipcode = checkNumericString(xss(req.query.zipcode), 'zipcode');
        locations = await getLocationsByZip(zipcode);
      } else if (req.query.tags) {
        const tags = parseTags(req.query.tags);
        locations = await getLocationsByTag(tags);
      } else {
        locations = await getAllLocations();
      }

      return res.render('locations', {
        title: 'Locations',
        locations
      });
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Locations Error',
        error: e.toString()
      });
    }
  })

  //creates a new user-submitted location
  .post(middleware.getuser, async (req, res) => {
    try {
      const userId = checkId(req.session.member._id, 'userId');

      const name = checkString(xss(req.body.name), 'name');
      check_length(name, 1, 100);

      const address = checkString(xss(req.body.address), 'address');
      check_length(address, 5, 200);

      const zipcode = checkNumericString(xss(req.body.zipcode), 'zipcode');
      check_length(zipcode, 5, 5);

      const coordinates = {
        lat: req.body.lat,
        lng: req.body.lng
      };

      const tags = parseTags(req.body.tags);

      const locationId = await addLocation(
        userId,
        name,
        address,
        zipcode,
        coordinates,
        tags
      );

      return res.redirect(`/locations/${locationId}`);
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Create Location Error',
        error: e.toString()
      });
    }
  });

//renders the map page for locations
router.get('/map', async (req, res) => {
  try {
    const locations = await getAllLocations();

    return res.render('map', {
      title: 'Location Map',
      locations
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Map Error',
      error: e.toString()
    });
  }
});

//renders the form for creating a new location
router.get('/new', middleware.getuser, async (req, res) => {
  try {
    return res.render('newLocation', {
      title: 'Add Location'
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'New Location Error',
      error: e.toString()
    });
  }
});

//returns location search results as JSON for AJAX/client-side search
router.get('/api/search', async (req, res) => {
  try {
    let locations = [];

    if (req.query.name) {
      const name = checkString(xss(req.query.name), 'name');
      locations = await getLocationsByName(name);
    } else if (req.query.zipcode) {
      const zipcode = checkNumericString(xss(req.query.zipcode), 'zipcode');
      locations = await getLocationsByZip(zipcode);
    } else if (req.query.tags) {
      const tags = parseTags(req.query.tags);
      locations = await getLocationsByTag(tags);
    } else {
      locations = await getAllLocations();
    }

    return res.json({
      success: true,
      locations
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString()
    });
  }
});

//returns location marker data as JSON for the map
router.get('/api/map', async (req, res) => {
  try {
    const locations = await getAllLocations();

    const markers = locations.map((location) => ({
      _id: location._id.toString(),
      name: location.name,
      address: location.address,
      zipcode: location.zipcode,
      coordinates: location.coordinates,
      tags: location.tags,
      average_safety_rating:
        location.average_safety_rating || location.average_saftey_rating || 0
    }));

    return res.json({
      success: true,
      locations: markers
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString()
    });
  }
});

//renders the edit form for a location
router.get('/:id/edit', middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');
    const location = await getLocationById(locationId);

    return res.render('editLocation', {
      title: 'Edit Location',
      location
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Edit Location Error',
      error: e.toString()
    });
  }
});

//updates editable fields for a location
router.post('/:id/edit', middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');
    const tags = parseTags(req.body.tags);

    await updateLocation(locationId, tags);

    return res.redirect(`/locations/${locationId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Update Location Error',
      error: e.toString()
    });
  }
});

//deletes a location if the current user is authorized
router.post('/:id/delete', middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');

    return notImplemented(
      res,
      'Requires completed removeLocation(locationId, userId) implementation in data/locations.js.'
    );
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Delete Location Error',
      error: e.toString()
    });
  }
});

//creates a review for a specific location
router.post('/:id/reviews', middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');
    const userId = checkId(req.session.member._id, 'userId');

    const content = checkString(xss(req.body.content), 'content');
    check_length(content, 1, 1000);

    /*
    TODO:
    Requires addReview(userId, locationId, content, safetyRating) from data/reviews.js.
    */

    return notImplemented(
      res,
      'Requires addReview(userId, locationId, content, safetyRating) implementation in data/reviews.js.'
    );
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Review Error',
      error: e.toString()
    });
  }
});

//marks a specific location as visited for the logged-in user
router.post('/:id/visited', middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');
    const userId = checkId(req.session.member._id, 'userId');

    return notImplemented(
      res,
      'Requires markLocationVisited(userId, locationId) implementation in data/users.js or data/locations.js.'
    );
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Visited Error',
      error: e.toString()
    });
  }
});

//reports a location for moderation/admin review
router.post('/:id/reports', middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');
    const userId = checkId(req.session.member._id, 'userId');

    const content = checkString(xss(req.body.content), 'content');
    check_length(content, 5, 500);

    await reports.addReport(userId, locationId, 'location', content);

    return res.redirect(req.get('Referrer') || `/locations/${locationId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Report Location Error',
      error: e.toString()
    });
  }
});

//renders one location detail page by id using the current location.handlebars top-level field structure
router.get('/:id', async (req, res) => {
  try {
    const locationId = checkId(req.params.id, 'locationId');
    const location = await getLocationById(locationId);

    /*
    TODO:
    Add getReviewsByLocationId(locationId) from data/reviews.js later.
    For now, location.reviews may only contain review IDs.
    */

    return res.render('location', {
      title: location.name || 'Location',
      _id: location._id.toString(),
      name: location.name,
      address: location.address,
      zipcode: location.zipcode,
      coordinates: location.coordinates,
      likes: location.likes || 0,
      dislikes: location.dislikes || 0,
      tags: location.tags || [],
      reviews: location.reviews || [],
      images: location.images || location.pictures || [],
      average_safety_rating:
        location.average_safety_rating || location.average_saftey_rating || 0
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Location Error',
      error: e.toString()
    });
  }
});

export default router;
