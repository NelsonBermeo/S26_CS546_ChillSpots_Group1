import {Router} from 'express';
import xss from 'xss';
import { checkId,checkString, check_length} from '../validation.js';
const router = Router();

/*
TODO:
-middleware/auth.js needs to be completed in order to finalize this route
-I also looked at reviews data, and in its current state it still needs a few fixes before this can fully work

Assumed future review data functions:
- toggleReviewLike(reviewId, userId)
- toggleReviewDislike(reviewId, userId)
- createReviewReport(reviewId, userId, username, reason)

Comments functionality is intentionally being kept separate for now in comments.js, but I might merge it with this later
*/

//helper function to detect whether the request expects a JSON response
const wantsJson = (req) => { return req.xhr || req.get('accept')?.includes('application/json'); };

//helper function so unfinished AJAX routes return a JSON error instead of crashing
const notImplementedJson = (res, todo) => {
  return res.status(501).json({
    success: false,
    error: todo
  });
};

//helper function so unfinished form/page routes render an error page instead of crashing
const notImplementedRender = (res, todo) => {
  return res.status(501).render('error', {
    title: 'Not Implemented',
    error: todo
  });
};

//adds a like reaction to a review
router.post('/:id/like', async (req, res) => {
  try {
    /*
    TODO:
    Add requireAuth middleware once implemented.
    */

    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'You must be logged in.'
      });
    }

    const reviewId = checkId(req.params.id, 'reviewId');
    const userId = checkId(req.session.user._id, 'userId');

    /*
    TODO:
    Requires toggleReviewLike(reviewId, userId).

    This function should:
    - validate review exists
    - prevent duplicate likes from same user
    - remove user's dislike first if one exists
    - return updated likes/dislikes counts
    */

    return notImplementedJson(
      res,
      'Requires toggleReviewLike(reviewId, userId) implementation in data/reviews.js.'
    );

    /*
    const reaction = await toggleReviewLike(reviewId, userId);

    return res.json({
      success: true,
      likes: reaction.likes,
      dislikes: reaction.dislikes,
      userReaction: reaction.userReaction
    });
    */
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString()
    });
  }
});

//adds a dislike reaction to a review
router.post('/:id/dislike', async (req, res) => {
  try {
    /*
    TODO:
    Add requireAuth middleware once implemented.
    */

    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'You must be logged in.'
      });
    }

    const reviewId = checkId(req.params.id, 'reviewId');
    const userId = checkId(req.session.user._id, 'userId');

    /*
    TODO:
    Requires toggleReviewDislike(reviewId, userId).

    This function should:
    - validate review exists
    - prevent duplicate dislikes from same user
    - remove user's like first if one exists
    - return updated likes/dislikes counts
    */

    return notImplementedJson(
      res,
      'Requires toggleReviewDislike(reviewId, userId) implementation in data/reviews.js.'
    );

    /*
    const reaction = await toggleReviewDislike(reviewId, userId);

    return res.json({
      success: true,
      likes: reaction.likes,
      dislikes: reaction.dislikes,
      userReaction: reaction.userReaction
    });
    */
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString()
    });
  }
});

//creates a moderation/admin report against a review
router.post('/:id/reports', async (req, res) => {
  try {
    /*
    TODO:
    Add requireAuth middleware once implemented.
    */

    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const reviewId = checkId(req.params.id, 'reviewId');
    const userId = checkId(req.session.user._id, 'userId');

    const reason = checkString(
      xss(req.body.reason),
      'reason'
    );

    check_length(reason, 5, 500);

    /*
    TODO:
    Better long-term location may be data/reports.js instead of data/reviews.js.

    Requires createReviewReport(reviewId, userId, username, reason).

    This function should:
    - validate review exists
    - create report document with type "review"
    - store item_id as reviewId
    - store reporter info
    - optionally prevent duplicate reports from same user
    */

    return notImplementedRender(
      res,
      'Requires createReviewReport(reviewId, userId, username, reason) implementation in data/reviews.js or data/reports.js.'
    );

    /*
    await createReviewReport(
      reviewId,
      userId,
      req.session.user.username,
      reason
    );

    return res.redirect(req.get('Referrer') || `/reviews/${reviewId}`);
    */
  } catch (e) {
    if (wantsJson(req)) {
      return res.status(400).json({
        success: false,
        error: e.toString()
      });
    }

    return res.status(400).render('error', {
      title: 'Report Error',
      error: e.toString()
    });
  }
});

export default router;
