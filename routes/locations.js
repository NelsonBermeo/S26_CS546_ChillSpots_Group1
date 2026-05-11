import { Router } from "express";
import xss from "xss";
import {
  checkId,
  checkString,
  checkStringArray,
  checkNumericString,
  check_length,
} from "../validation.js";
import { middleware } from "../middleware/auth.js";

import {
  addLocation,
  getLocationById,
  updateLocation,
  getAllLocations,
  getLocationsByTag,
  getLocationsByName,
  getLocationsByZip,
  toggleLocationLike,
  toggleLocationDislike,
  getLocationByFilters,
  allowedTags
} from "../data/locations.js";

import { addReview, getReviewsByLocationId } from "../data/reviews.js";
import * as reports from "../data/reports.js";
import {
  checkReviewAchievements,
  checkLocationAchievements,
  checkLocationLikeAchievements,
} from "../data/achievements.js";
import {upload} from "../middleware/upload.js"
import {uploadMultipleImages} from "../utils/imageUpload.js"
import { userHasVisited, userVisited } from "../data/users.js";

const router = Router();

/*
TODO:
-auth/login must store req.session.member._id because this file uses current middleware/auth.js session setup
-location.handlebars form action should be /location/{{_id}}/reviews
-location.handlebars report form action should be /location/{{_id}}/reports
-I took a look at data/locations.js, it still needs a few additions/fixes:
  -addLocation seems to set lat from coordinates.lng instead of coordinates.lat
  -average_saftey_rating is misspelled
-data/reviews.js now exports addReview, but it still needs duplicate-review prevention so one user cannot review the same location multiple times
-data/reviews.js needs getReviewsByLocationId(locationId) so location detail pages can render full review objects
-data/users.js or data/locations.js needs markLocationVisited(userId, locationId)
-location like/dislike links exist in the view, but data functions/routes for location reactions are not implemented yet
*/

//renders a temporary "Not Implemented" error page for unfinished route functionality
const notImplemented = (res, todo) => {
  return res.status(501).render("error", {
    title: "Not Implemented",
    error: todo,
  });
};

//sanitizes, normalizes, and validates location tags from form/query input
const parseTags = (rawTags) => {
  if (!rawTags) return [];

  let tags = rawTags;

  if (!Array.isArray(tags)) {
    tags = tags.split(",").map((tag) => tag.trim());
  }

  tags = tags.map((tag) => xss(tag).toLowerCase());

  return checkStringArray(tags, "tags");
};

//renders the main locations browse/search page
router
  .route("/")
  .get(middleware.getuser, async (req, res) => {
    try {
      let likes = undefined;
      if (req.query.likes === "true") {
        likes = true;
      } else if (req.query.likes === "false") {
        likes = false;
      }

      let friend_visited = undefined;
      if (req.query.friend_visited === "true") {
        friend_visited = true;
      } else if (req.query.friend_visited === "false") {
        friend_visited = false;
      }

      const zip = req.query.zip || null;

      const name = req.query.loc_name || null;

      let tags = req.query.tags || null;
      if (tags && typeof tags === "string") {
        tags = tags.split(",").map((t) => t.trim());
      }

      try {
        const locations = await getLocationByFilters(
          req.session.member._id,
          likes,
          friend_visited,
          zip,
          name,
          tags,
        );

        return res.render("location", {
          title: "ChillSpots - Search Locations",
          locations,
          query: req.query.loc_name || "",
          zip: req.query.zip || "",
          tags: req.query.tags || "",
        });
      } catch (err) {
        return res.status(400).render("location", {
          title: "ChillSpots - Search Locations",
          error: err,
          locations: undefined,
          query: req.query.loc_name || "",
          zip: req.query.zip || "",
          tags : req.query.tags || "",
          loggedIn: Boolean(req.session.member),
          isAdmin: (Boolean(req.session.member)) ? 
              req.session.member.role === 'admin' :
              undefined
        });
      }
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Locations Error',
        error: e.toString(),
        loggedIn: Boolean(req.session.member),
        isAdmin: (Boolean(req.session.member)) ? 
            req.session.member.role === 'admin' :
            undefined
      });
    }
  })

  //creates a new user-submitted location
  .post(middleware.getuser, upload.array("locPics", 5), async (req, res) => {
    try {
      const userId = checkId(req.session.member._id, "userId");

      const name = checkString(xss(req.body.name), "name");
      check_length(name, 1, 100);

      const address = checkString(xss(req.body.address), "address");
      check_length(address, 5, 200);

      const zipcode = checkNumericString(xss(req.body.zipcode), "zipcode");
      check_length(zipcode, 5, 5);

      const coordinates = {
        lat: req.body.lat,
        lng: req.body.lng,
      };

      const pictures = await uploadMultipleImages(req.files, "locations");
      const tags = parseTags(req.body.tags);

      const locationId = await addLocation(
        userId,
        name,
        address,
        zipcode,
        coordinates,
        pictures,
        tags,
      );

      try {
        await checkLocationAchievements(userId);
      } catch (e) {}

      return res.redirect(`/location/${locationId}`);
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Create Location Error',
        error: e.toString(),
        loggedIn: Boolean(req.session.member),
        isAdmin: (Boolean(req.session.member)) ? 
            req.session.member.role === 'admin' :
            undefined
      });
    }
  });

//renders the map page for locations
router.get("/map", middleware.getuser, async (req, res) => {
  try {
    const locations = await getAllLocations();

    return res.render("map", {
      title: "Location Map",
      locations,
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Map Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//renders the form for creating a new location
router.get("/new", middleware.getuser, async (req, res) => {
  try {
    return res.render("newLocation", {
      title: "Add Location",
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'New Location Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//returns location search results as JSON for AJAX/client-side search
router.get("/api/search", middleware.getuser, async (req, res) => {
  try {
    let locations = [];

    if (req.query.name) {
      const name = checkString(xss(req.query.name), "name");
      locations = await getLocationsByName(name);
    } else if (req.query.zipcode) {
      const zipcode = checkNumericString(xss(req.query.zipcode), "zipcode");
      locations = await getLocationsByZip(zipcode);
    } else if (req.query.tags) {
      const tags = parseTags(req.query.tags);
      locations = await getLocationsByTag(tags);
    } else {
      locations = await getAllLocations();
    }

    return res.json({
      success: true,
      locations,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString(),
    });
  }
});

//returns location marker data as JSON for the map
router.get("/api/map", middleware.getuser, async (req, res) => {
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
        location.average_safety_rating || location.average_saftey_rating || 0,
    }));

    return res.json({
      success: true,
      locations: markers,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString(),
    });
  }
});

//toggles like on a location for the logged-in user
router.post("/:id/like", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const userId = checkId(req.session.member._id, "userId");

    let updatedLocation = await toggleLocationLike(locationId, userId);

    try {
      await checkLocationLikeAchievements(locationId);
    } catch (e) {}

    return res.json({
      success: true,
      likes: updatedLocation.likes,
      dislikes: updatedLocation.dislikes,
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Location Like Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//toggles dislike on a location for the logged-in user
router.post("/:id/dislike", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const userId = checkId(req.session.member._id, "userId");

    let updatedLocation = await toggleLocationDislike(locationId, userId);

    return res.json({
      success: true,
      likes: updatedLocation.likes,
      dislikes: updatedLocation.dislikes,
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Location Dislike Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//renders the edit form for a location
router.get("/:id/edit", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");

    return notImplemented(
      res,
      "Requires views/editLocation.handlebars before this route can render an edit form.",
    );

    /*
    const location = await getLocationById(locationId);

    return res.render('editLocation', {
      title: 'Edit Location',
      location
    });
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Edit Location Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//updates editable fields for a location
router.post("/:id/edit", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const tags = parseTags(req.body.tags);

    await updateLocation(locationId, tags);

    return res.redirect(`/location/${locationId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Update Location Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//deletes a location if the current user is authorized
router.post("/:id/delete", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");

    return notImplemented(
      res,
      "Requires verified removeLocation(locationId, userId) implementation and owner/admin authorization.",
    );
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Delete Location Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//creates a review for a specific location
router.post("/:id/reviews", middleware.getuser, upload.array("reviewPics", 5),async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const userId = checkId(req.session.member._id, "userId");

    const content = checkString(xss(req.body.content), "content");
    check_length(content, 1, 1000);

    const safetyRating = checkNumericString(
      xss(req.body.safetyRating),
      "safetyRating",
    );

    const pictures = await uploadMultipleImages(req.files, "reviews");

    /*
    TODO:
    data/reviews.js currently names this parameter safteyRating internally.
    The route can still pass safetyRating from the form, but the data layer spelling should eventually be standardized.
    */

    await addReview(userId, locationId, content, pictures, safetyRating);

    try {
      await checkReviewAchievements(userId);
    } catch (e) {}

    return res.redirect(`/location/${locationId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Review Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//marks a specific location as visited for the logged-in user
router.post("/:id/visited", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const userId = checkId(req.session.member._id, "userId");

    const userVisted = await userHasVisited(userId, locationId);
    if (userVisted) {
      const locations = await getLocationByFilters(
        req.session.member._id,
        null,
        null,
        null,
        null,
        null,
      );

      return res.render("location", {
        title: "ChillSpots - Search Locations",
        locations
      });
    } else {
      const success = userVisited(userId, locationId);
      if (!success) {
        return res.status(400).render('error', {
          title: 'Visited Error',
          error: "Could not visit this location.",
          loggedIn: Boolean(req.session.member),
          isAdmin: (Boolean(req.session.member)) ? 
            req.session.member.role === 'admin' :
            undefined});
      }
    }
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Visited Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//reports a location for moderation/admin review
router.post("/:id/reports", middleware.getuser, async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const userId = checkId(req.session.member._id, "userId");

    const rawContent = req.body.content || req.body.reason;
    const content = checkString(xss(rawContent), "content");
    check_length(content, 5, 500);

    await reports.addReport(userId, locationId, "location", content);

    return res.redirect(req.get("Referrer") || `/location/${locationId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Report Location Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

//renders one location detail page by id using the current location.handlebars top-level field structure
router.get("/:id", async (req, res) => {
  try {
    const locationId = checkId(req.params.id, "locationId");
    const location = await getLocationById(locationId);

    /*
    TODO:
    Add getReviewsByLocationId(locationId) from data/reviews.js later.
    For now, location.reviews may only contain review IDs.
    */
    const reviewList = await getReviewsByLocationId(locationId);
    return res.render("location", {
      title: location.name || "Location",
      locations: [{
      _id: location._id.toString(),
      name: location.name,
      address: location.address,
      zipcode: location.zipcode,
      coordinates: location.coordinates,
      likes: location.likes || 0,
      dislikes: location.dislikes || 0,
      tags: location.tags || [],
      reviews: reviewList || [],
      images: location.images || location.pictures || [],
      average_safety_rating:
        location.average_safety_rating || location.average_saftey_rating || 0,
      }]
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Location Error',
      error: e.toString(),
      loggedIn: Boolean(req.session.member),
      isAdmin: (Boolean(req.session.member)) ? 
          req.session.member.role === 'admin' :
          undefined
    });
  }
});

export default router;
