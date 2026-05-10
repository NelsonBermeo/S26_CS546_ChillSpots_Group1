import {Router} from 'express';
import xss from 'xss';
import {checkId, checkString, check_length} from '../validation.js';
import {middleware} from '../middleware/auth.js';
import {getUserById} from '../data/users.js';

const router = Router();

/*
TODO:
-auth/login must store req.session.member._id because this file uses current middleware/auth.js session setup
-routes/index.js currently mounts this at /user, so redirects should use /user/profile unless the mount is changed to /users
-profile.handlebars may expect top-level fields, while getUserById returns fields like first_name, last_name, profile_picture
-data/users.js still needs:
  - getUserFriends(userId)
  - getUserPublicLists(userId)
  - getUserVisitedLocations(userId)
  - addFriend(userId, friendId)
  - createUserList(userId, listName, description)
*/

//renders a temporary "Not Implemented" error page for unfinished route functionality
const notImplemented = (res, todo) => {
  return res.status(501).render('error', {
    title: 'Not yet Implemented',
    error: todo
  });
};

//renders the currently logged-in user's profile page
router.get('/profile', middleware.getuser, async (req, res) => {
  try {
    const userId = checkId(req.session.member._id, 'userId');
    const user = await getUserById(userId);

    return res.render('profile', {
      title: 'My Profile',
      user,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      email: user.email,
      profilePic: user.profile_picture,
      reviews: user.reviews || [],
      friends: user.friends_list || [],
      visited: user.visited_locations_list || [],
      lists: user.public_lists || [],
      achievements: user.achievements || []
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//adds another user to the currently logged-in user's friends list
router.post('/profile/friends', middleware.getuser, async (req, res) => {
  try {
    const userId = checkId(req.session.member._id, 'userId');
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

    return res.redirect('/user/profile');
    */
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

//creates a new public list for the currently logged-in user
router.post('/profile/lists', middleware.getuser, async (req, res) => {
  try {
    const userId = checkId(req.session.member._id, 'userId');

    const listName = checkString(xss(req.body.listName), 'listName');
    check_length(listName, 1, 100);

    let description = '';

    if (req.body.description !== undefined && req.body.description !== null) {
      if (typeof req.body.description !== 'string') {
        throw 'Error: description must be a string';
      }

      if (req.body.description.trim() !== '') {
        description = checkString(xss(req.body.description), 'description');
        check_length(description, 1, 500);
      }
    }

    return notImplemented(
      res,
      'Requires createUserList(userId, listName, description) implementation in data/users.js.'
    );

    /*
    await createUserList(userId, listName, description);

    return res.redirect('/user/profile');
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
      user,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      profilePic: user.profile_picture,
      reviews: user.reviews || [],
      friends: user.friends_list || [],
      visited: user.visited_locations_list || [],
      lists: user.public_lists || [],
      achievements: user.achievements || []
    });
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e.toString()
    });
  }
});

export default router;
