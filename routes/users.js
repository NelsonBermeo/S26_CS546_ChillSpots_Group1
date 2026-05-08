import {Router} from 'express';
import xss from 'xss';
import {checkId, checkString, check_length} from '../validation.js';
import { getUserById } from '../data/users.js';
const router = Router();

/*
TODO:
-middleware/auth.js needs to be completed in order to finalize this route
-users.js data code needs to be fully implemented before these routes can fully function (looks like it doenst export anything right now)
For now, I will assume these functions will be eventually implemented in some form:
- getUserFriends(userId)
- getUserPublicLists(userId)
- getUserVisitedLocations(userId)
- addFriend(userId, friendId)
- createUserList(userId, listName, description)

Each part of that future implementation is commented out for now so they can be added later once ready
*/

//helper function so unfinished routes will display error instead of simply crashing
const notImplemented = (res, todo) => {
  return res.status(501).render('error', {
    title: 'Not yet Implemented',
    error: todo
  });
};

//renders the currently logged-in user's profile page
router.get('/profile', async (req, res) => {
  try {
    /*
    TODO:
    Add middleware aspects once that file is implemented
    */

    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = checkId(req.session.user._id, 'userId');

    const user = await getUserById(userId);

    return res.render('profile', {
      title: 'My Profile',
      user
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//adds another user to the currently logged-in user's friends list
router.post('/profile/friends', async (req, res) => {
  try {
    /*
    TODO:
    Add middleware aspects once that file is implemented
    */

    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = checkId(req.session.user._id, 'userId');
    const friendId = checkId(req.body.friendId, 'friendId');

    if (userId === friendId) {
      return res.status(400).render('error', {
        title: 'Error',
        error: 'You cannot add yourself as a friend.'
      });
    }

    return notImplemented(
      res,
      'Requires addFriend(userId, friendId) implementation in data/users.js.'
    );

    /*
    await addFriend(userId, friendId);

    return res.redirect('/users/profile');
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//creates a new public list for the currently logged-in user
router.post('/profile/lists', async (req, res) => {
  try {
    /*
    TODO:
    Add middleware aspects once that file is implemented
    */

    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = checkId(req.session.user._id, 'userId');

    const listName = checkString(
      xss(req.body.listName),
      'listName'
    );

    check_length(listName, 1, 100);

    let description = '';

    if (
      req.body.description !== undefined &&
      req.body.description !== null &&
      req.body.description.trim() !== ''
    ) {
      description = checkString(
        xss(req.body.description),
        'description'
      );

      check_length(description, 1, 500);
    }

    return notImplemented(
      res,
      'Requires createUserList(userId, listName, description) implementation in data/users.js.'
    );

    /*
    await createUserList(userId, listName, description);

    return res.redirect('/users/profile');
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//displays the friends list for a specific user profile
router.get('/:id/friends', async (req, res) => {
  try {
    const userId = checkId(req.params.id, 'userId');

    return notImplemented(
      res,
      'Requires getUserFriends(userId) implementation in data/users.js.'
    );

    /*
    const user = await getUserById(userId);
    const friends = await getUserFriends(userId);

    return res.render('profile', {
      title: `${user.username}'s Friends`,
      user,
      friends
    });
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//displays the public/custom lists belonging to a specific user 
router.get('/:id/lists', async (req, res) => {
  try {
    const userId = checkId(req.params.id, 'userId');

    return notImplemented(
      res,
      'Requires getUserPublicLists(userId) implementation in data/users.js.'
    );

    /*
    const user = await getUserById(userId);
    const lists = await getUserPublicLists(userId);

    return res.render('profile', {
      title: `${user.username}'s Lists`,
      user,
      lists
    });
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//displays the locations a specific user has marked as visited
router.get('/:id/visited', async (req, res) => {
  try {
    const userId = checkId(req.params.id, 'userId');

    return notImplemented(
      res,
      'Requires getUserVisitedLocations(userId) implementation in data/users.js.'
    );

    /*
    const user = await getUserById(userId);
    const visited = await getUserVisitedLocations(userId);

    return res.render('profile', {
      title: `${user.username}'s Visited Spots`,
      user,
      visited
    });
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//renders the public profile page for a specific user
router.get('/:id', async (req, res) => {
  try {
    const userId = checkId(req.params.id, 'userId');

    const user = await getUserById(userId);

    return res.render('profile', {
      title: `${user.username}'s Profile`,
      user
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

export default router;
