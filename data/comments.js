import { ObjectId } from 'mongodb';
import { comments, reviews, users } from '../config/mongoCollections.js';
import { checkId, checkString, check_length } from '../vaidation.js';

//adding a comment onto a review
const addComment = async (reviewId, userId, commentText) => {
  reviewId = checkId(reviewId, 'reviewId');
  userId = checkId(userId, 'userId');
  commentText = checkString(commentText, 'commentText');
  check_length(commentText, 1, 500);
  const reviewCollection = await reviews();
  const userCollection = await users();
  const commentCollection = await comments();
  // just making sure the review actually exists first
  const review = await reviewCollection.findOne({
    _id: new ObjectId(reviewId)
  });
  if (!review) throw 'Error: Review not found';
  //grabbing the user too so we can save username with comment
  const user = await userCollection.findOne({
    _id: new ObjectId(userId)
  });
  if (!user) throw 'Error: User not found';
  const newComment = {
    reviewId: new ObjectId(reviewId),
    userId: new ObjectId(userId),
    username: user.username,
    commentText: commentText,
    createdAt: new Date(),
    updatedAt: null
  };
  const insertInfo = await commentCollection.insertOne(newComment);
  if (!insertInfo.insertedId || !insertInfo.acknowledged) {
    throw 'Error: Could not add comment';
  }
  //pushing comment id into review comments array
  //easier later if we wanna populate comments on review page
  await reviewCollection.updateOne(
    { _id: new ObjectId(reviewId) },
    { $push: { comments: insertInfo.insertedId } }
  );
  return await getCommentById(insertInfo.insertedId.toString());
};

const getCommentById = async (commentId) => {
  commentId = checkId(commentId, 'commentId');
  const commentCollection = await comments();
  const comment = await commentCollection.findOne({
    _id: new ObjectId(commentId)
  });
  if (!comment) throw 'Error: Comment not found';
  //converting object ids to strings for frontend stuff
  comment._id = comment._id.toString();
  comment.reviewId = comment.reviewId.toString();
  comment.userId = comment.userId.toString();
  return comment;
};

const getCommentsByReviewId = async (reviewId) => {
  reviewId = checkId(reviewId, 'reviewId');
  const reviewCollection = await reviews();
  //checking if review exists before trying to get comments
  const review = await reviewCollection.findOne({
    _id: new ObjectId(reviewId)
  });
  if (!review) throw 'Error: Review not found';
  const commentCollection = await comments();
  const commentList = await commentCollection
    .find({ reviewId: new ObjectId(reviewId) })
    .sort({ createdAt: 1 })
    .toArray();
  //converting ids here too
  return commentList.map((comment) => {
    comment._id = comment._id.toString();
    comment.reviewId = comment.reviewId.toString();
    comment.userId = comment.userId.toString();
    return comment;
  });
};
const updateComment = async (commentId, userId, newCommentText) => {
  commentId = checkId(commentId, 'commentId');
  userId = checkId(userId, 'userId');
  newCommentText = checkString(newCommentText, 'newCommentText');
  check_length(newCommentText, 1, 500);
  const commentCollection = await comments();
  const comment = await commentCollection.findOne({
    _id: new ObjectId(commentId)
  });
  if (!comment) throw 'Error: Comment not found';
  //only letting users edit their own comments
  if (comment.userId.toString() !== userId) {
    throw 'Error: You can only update your own comment';
  }
  const updateInfo = await commentCollection.updateOne(
    { _id: new ObjectId(commentId) },
    {
      $set: {
        commentText: newCommentText,
        updatedAt: new Date()
      }
    }
  );
  if (!updateInfo.matchedCount || !updateInfo.modifiedCount) {
    throw 'Error: Could not update comment';
  }
  return await getCommentById(commentId);
};

const removeComment = async (commentId, userId) => {
  commentId = checkId(commentId, 'commentId');
  userId = checkId(userId, 'userId');
  const commentCollection = await comments();
  const reviewCollection = await reviews();
  const comment = await commentCollection.findOne({
    _id: new ObjectId(commentId)
  });

  if (!comment) throw 'Error: Comment not found';
  //same thing here, only owner can delete
  if (comment.userId.toString() !== userId) {
    throw 'Error: You can only delete your own comment';
  }
  const deleteInfo = await commentCollection.deleteOne({
    _id: new ObjectId(commentId)
  });
  if (!deleteInfo.deletedCount) {
    throw 'Error: Could not delete comment';
  }
  //removing comment id from review comments array too
  await reviewCollection.updateOne(
    { _id: comment.reviewId },
    { $pull: { comments: new ObjectId(commentId) } }
  );
  return {
    commentId: commentId,
    deleted: true
  };
};

export {
  addComment,
  getCommentById,
  getCommentsByReviewId,
  updateComment,
  removeComment
};