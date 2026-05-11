import { Router } from 'express';
import xss from 'xss';
import { ObjectId } from 'mongodb';
import { checkId, checkString } from '../validation.js';
import { middleware } from '../middleware/auth.js';
import {
  VALID_TAGS,
  createList,
  getListById,
  getAllLists,
  updateList,
  addLocationToList,
  removeLocationFromList,
  removeList,
  getLocationsNotInList
} from '../data/publicLists.js';
import { getUserById } from '../data/users.js';
import { locations } from '../config/mongoCollections.js';
import { checkListAchievements } from '../data/achievements.js';

const router = Router();

//browses all public lists and create a new one
router
  .route('/')
  .get(middleware.getuser, async (req, res) => {
    try {
      const allLists = await getAllLists();
      //attaches username to each list for display
      for (let i = 0; i < allLists.length; i++) {
        try {
          const creator = await getUserById(allLists[i].user_id);
          allLists[i].username = creator.username;
        } catch (e) {
          allLists[i].username = 'Unknown';
        }
      }
      return res.render('publiclists', {
        title: 'Public Lists',
        publicLists: allLists,
        allowedTags: VALID_TAGS,
        loggedIn: true,
        isAdmin: req.session.member.role === 'admin'
      });
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Public Lists Error',
        error: e.toString()
      });
    }
  })
  .post(middleware.getuser, async (req, res) => {
    try {
      const userId = checkId(req.session.member._id, 'userId');
      const name = checkString(xss(req.body.listName), 'listName');
      let tags = [];
      if (req.body.listTags) {
        const rawTags = xss(req.body.listTags).split(',');
        for (let i = 0; i < rawTags.length; i++) {
          const tag = rawTags[i].trim().toLowerCase();
          if (tag.length > 0) {
            tags.push(tag);
          }
        }
      }
      const list = await createList(userId, name, [], tags);
      try {
        await checkListAchievements(userId, list.location_list.length);
      } catch (e) {
      }
      return res.redirect(`/publiclists/${list._id}`);
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Create List Error',
        error: e.toString()
      });
    }
  });

//views a single list
router.get('/:id', middleware.getuser, async (req, res) => {
  try {
    const listId = checkId(req.params.id, 'listId');
    const userId = req.session.member._id;
    const list = await getListById(listId);
    try {
      const creator = await getUserById(list.user_id);
      list.username = creator.username;
    } catch (e) {
      list.username = 'Unknown';
    }
    //gets full location objects for locations in the list
    const locationCollection = await locations();
    const locationObjects = [];
    for (let i = 0; i < list.location_list.length; i++) {
      const loc = await locationCollection.findOne({ _id: new ObjectId(list.location_list[i]) });
      if (loc) {
        loc._id = loc._id.toString();
        locationObjects.push(loc);
      }
    }
    const notUsedLocations = await getLocationsNotInList(listId);
    const editsAllowed = list.user_id === userId;
    return res.render('publiclist', {
      title: list.name,
      list,
      locations: locationObjects,
      notUsedLocations,
      editsAllowed,
      loggedIn: true,
      isAdmin: req.session.member.role === 'admin'
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'List Error',
      error: e.toString()
    });
  }
});

//edits list name
router.post('/:id/edit', middleware.getuser, async (req, res) => {
  try {
    const listId = checkId(req.params.id, 'listId');
    const userId = checkId(req.session.member._id, 'userId');
    const name = checkString(xss(req.body.listName), 'listName');
    await updateList(listId, userId, { name: name });
    return res.redirect(`/publiclists/${listId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Edit List Error',
      error: e.toString()
    });
  }
});

//adds a location to a list
router.post('/:id/locations', middleware.getuser, async (req, res) => {
  try {
    const listId = checkId(req.params.id, 'listId');
    const userId = checkId(req.session.member._id, 'userId');
    const locationId = checkId(xss(req.body.locationId), 'locationId');
    const updatedList = await addLocationToList(listId, userId, locationId);
    try {
      await checkListAchievements(userId, updatedList.location_list.length);
    } catch (e) {
    }
    return res.redirect(`/publiclists/${listId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Add Location Error',
      error: e.toString()
    });
  }
});

//removes a location from a list
router.post('/:id/locations/:locationId/remove', middleware.getuser, async (req, res) => {
  try {
    const listId = checkId(req.params.id, 'listId');
    const userId = checkId(req.session.member._id, 'userId');
    const locationId = checkId(req.params.locationId, 'locationId');
    await removeLocationFromList(listId, userId, locationId);
    return res.redirect(`/publiclists/${listId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Remove Location Error',
      error: e.toString()
    });
  }
});

//deletes a list
router.post('/:id/delete', middleware.getuser, async (req, res) => {
  try {
    const listId = checkId(req.params.id, 'listId');
    const userId = checkId(req.session.member._id, 'userId');
    await removeList(listId, userId);
    return res.redirect('/publiclists');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Delete List Error',
      error: e.toString()
    });
  }
});

export default router;
