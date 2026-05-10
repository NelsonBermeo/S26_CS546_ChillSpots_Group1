import {Router} from 'express';
import xss from 'xss';
import {checkId, checkString, check_length} from '../validation.js';
import {middleware} from '../middleware/auth.js';
import * as reports from '../data/reports.js';

const router = Router();

/*
TODO:
-auth/login must store req.session.member._id because this file uses current middleware/auth.js session setup
-data/reviews.js still needs reaction helpers:
  - toggleReviewLike(reviewId, userId)
  - toggleReviewDislike(reviewId, userId)
-data/reviews.js currently stores reaction counts only, so duplicate prevention needs likedBy/dislikedBy arrays or another tracking method
-comments functionality is intentionally being kept separate for now in comments.js
-data/comments.js import/mounting still needs to be fixed before comments can work
*/

//checks whether the request expects a JSON response instead of a rendered page
const wantsJson = (req) => {
  return req.xhr || req.get('accept')?.includes('application/json');
};

//returns a temporary JSON error response for unfinished AJAX/API functionality
const notImplementedJson = (res, todo) => {
  return res.status(501).json({
    success: false,
    error: todo
  });
};

//adds a like reaction to a review
router.post('/:id/like', middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, 'reviewId');
    const userId = checkId(req.session.member._id, 'userId');

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
router.post('/:id/dislike', middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, 'reviewId');
    const userId = checkId(req.session.member._id, 'userId');

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

//submits a report against a review for moderation/admin review
router.post('/:id/reports', middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, 'reviewId');
    const userId = checkId(req.session.member._id, 'userId');

    const reason = checkString(xss(req.body.reason), 'reason');
    check_length(reason, 5, 500);

    await reports.addReport(userId, reviewId, 'review', reason);

    return res.redirect(req.get('Referrer') || '/');
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
