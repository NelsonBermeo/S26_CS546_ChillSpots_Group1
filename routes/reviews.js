import { Router } from "express";
import xss from "xss";
import { checkId, checkString, check_length } from "../validation.js";
import { middleware } from "../middleware/auth.js";
import * as reports from "../data/reports.js";
import { toggleReviewLike, toggleReviewDislike } from "../data/reviews.js";
import { checkReviewLikeAchievements } from "../data/achievements.js";

const router = Router();

/*
TODO:
-auth/login must store req.session.member._id because this file uses current middleware/auth.js session setup
-data/reviews.js still needs reaction helpers:
  - toggleReviewLike(reviewId, userId)
  - toggleReviewDislike(reviewId, userId)
-data/reviews.js currently stores reaction counts only, so duplicate prevention needs likedBy/dislikedBy arrays or another tracking method
-comments functionality is currently scaffolded here because the review partial posts to /reviews/:id/comments
-data/comments.js import/mounting still needs to be fixed before comments can fully work
*/

//checks whether the request expects a JSON response instead of a rendered page
const wantsJson = (req) => {
  const accept = req.get("accept") || "";
  return req.xhr || accept.includes("application/json");
};

//returns a temporary JSON error response for unfinished AJAX/API functionality
const notImplementedJson = (res, todo) => {
  return res.status(501).json({
    success: false,
    error: todo,
  });
};

//renders a temporary "Not Implemented" error page for unfinished form/page functionality
const notImplementedRender = (res, todo) => {
  return res.status(501).render("error", {
    title: "Not Implemented",
    error: todo,
  });
};

//adds a like reaction to a review
router.post("/:id/like", middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, "reviewId");
    const userId = checkId(req.session.member._id, "userId");

    let updatedReview = await toggleReviewLike(reviewId, userId);

    return res.json({
      success: true,
      likes: updatedReview.likes,
      dislikes: updatedReview.dislikes,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString(),
    });
  }
});

//adds a dislike reaction to a review
router.post("/:id/dislike", middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, "reviewId");
    const userId = checkId(req.session.member._id, "userId");

    let updatedReview = await toggleReviewDislike(reviewId, userId);

    return res.json({
      success: true,
      likes: updatedReview.likes,
      dislikes: updatedReview.dislikes,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.toString(),
    });
  }
});

//adds a comment to a review
router.post("/:id/comments", middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, "reviewId");
    const userId = checkId(req.session.member._id, "userId");

    const commentContent = checkString(
      xss(req.body.commentText || req.body.content),
      "comment",
    );

    check_length(commentContent, 1, 1000);

    return notImplementedRender(
      res,
      "Requires comment creation implementation in data/comments.js or data/reviews.js.",
    );

    /*
    await addComment(reviewId, userId, commentContent);

    return res.redirect(req.get('Referrer') || '/');
    */
  } catch (e) {
    return res.status(400).render("error", {
      title: "Comment Error",
      error: e.toString(),
    });
  }
});

//submits a report against a review for moderation/admin review
router.post("/:id/reports", middleware.getuser, async (req, res) => {
  try {
    const reviewId = checkId(req.params.id, "reviewId");
    const userId = checkId(req.session.member._id, "userId");

    const rawReason = req.body.reason || req.body.content;
    const reason = checkString(xss(rawReason), "reason");
    check_length(reason, 5, 500);

    await reports.addReport(userId, reviewId, "review", reason);

    return res.redirect(req.get("Referrer") || "/");
  } catch (e) {
    if (wantsJson(req)) {
      return res.status(400).json({
        success: false,
        error: e.toString(),
      });
    }

    return res.status(400).render("error", {
      title: "Report Error",
      error: e.toString(),
    });
  }
});

export default router;
