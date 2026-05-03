import { Router } from 'express';
const router = Router();

import {
  addComment,
  updateComment,
  removeComment
} from '../data/comments.js';

//adds comment to a review
router.post('/reviews/:reviewId/comments', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).render('error', {
        title: 'Error',
        error: 'You must be logged in to comment'
      });
    }
    const reviewId = req.params.reviewId;
    const userId = req.session.user._id;
    const commentText = req.body.commentText;
    await addComment(reviewId, userId, commentText);
    return res.redirect('back');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e
    });
  }
});

//edits comment
router.post('/comments/:commentId/edit', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).render('error', {
        title: 'Error',
        error: 'You must be logged in to edit a comment'
      });
    }
    const commentId = req.params.commentId;
    const userId = req.session.user._id;
    const newCommentText = req.body.commentText;
    await updateComment(commentId, userId, newCommentText);
    return res.redirect('back');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e
    });
  }
});

//deletes comment
router.post('/comments/:commentId/delete', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).render('error', {
        title: 'Error',
        error: 'You must be logged in to delete a comment'
      });
    }
    const commentId = req.params.commentId;
    const userId = req.session.user._id;
    await removeComment(commentId, userId);
    return res.redirect('back');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e
    });
  }
});

export default router;