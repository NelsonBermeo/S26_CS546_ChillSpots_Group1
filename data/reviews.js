import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'
import { checkId, checkString, checkNumericString, check_chars_1, check_chars_2, check_length, check_number_range} from "./validation.js"
import {reviews} from '../config/mongoCollections.js';

const addReview = async (
    userId,
    //username, we don't need username if we have the userID already
    location_id,
    content,
    pictures, //We can add pictures later, let's just get the data functions working
    // likes,
    // dislikes,
    // date,
    safteyRating,
    // comments
) => {
    userId = checkId(userId) // Must exist, be a string, be a ObjectId, must belong to a real user 
    const userCollection = await users()
    let userIdCheck = await userCollection.findOne({ id : userId })
    if (!userIdCheck){
        throw "Error: User ID does not exist"
    }

    checkId(location_id) //Must exist, be a string, be a ObjectId, must belong to locations collection
    const locationCollection = await locations()
    let locationIdCheck = await userCollection.findOne({ id : location_id })
    if (!locationIdCheck){
        throw "Error: Location ID does not exist"
    }

    content = checkString(content)
    check_length(content, 1, 1000)
    //Our content can be 1 - 1000 characters for now and can contain any char

    pictures =  
    // Optional, must be an array, each item must be a non empty string, each item should be a valid URL or image path, max 5 pictues

    safteyRating = checkNumericString(safteyRating)
    const parseSafteyRating = Number(safteyRating)
    check_number_range(parseSafteyRating, 1, 5)
    //Optional, must be a number between 1 and 5.

    const newReview = {
        "user_id" : new ObjectId(userId),
        "username" : userIdCheck.username,
        "location_id" : new ObjectId(location_id),
        "content" : content,
        "pictures": [], //empty for now
        "likes" : 0,
        "disikes" : 0,
        "date" : new Date(), //instant date
        "safteyRating" : safteyRating,
        "comments" : []
    }

    // Now we have to insert this into the reviews collection: 

    const reviewCollection = await reviews()
    const insertInfo = await reviewCollection.insertOne(newReview)

    if ( !insertInfo.insertedId || !insertInfo.acknowledged ) {
        throw "Error: Review Failed"
    }

    const reviewId = insertInfo.insertedId
    //Then we have to add this review to the user who uploaded it: 

    await userCollection.updateOne( { _id: new ObjectId(userId)}, { $push: {reviews: reviewId }})

    //Then we have to add this review to the location we added it to: 

    await userCollection.updateOne( { _id : new ObjectId( location_id ) }, { $push : { reviews : reviewId } } )

    // Then we'd need to update the average rating on the location which we will do soon.

    return reviewId

}

const getReviewById = async (id) => {
    id = checkId(id)
    const reviewCollection = await reviews()
    const review = await commentCollection.findOne({
        _id: new ObjectId(id)
    })
    if (!review) {
        throw "Error: Review not found"
    }
    return review
}

const getAllReviews = async () => {
    const reviewCollection = await reviews();
    let reviewList = await userCollection.find({}).toArray(); 
    return reviewList;
}

const updateReview = async (id, content, pictures, safteyRating) => {
    id = checkId(id)
    let updated_fields = {}

    if (content){
        content = checkString(content)
        check_length(content, 1, 1000)
        updated_fields.content = content
    }

    if (pictures){
        //Deal with later
    }

    if(safteyRating){
        safteyRating = checkNumericString(safteyRating)
        const parseSafteyRating = Number(safteyRating)
        check_number_range(parseSafteyRating, 1, 5)
    }

    if (Object.keys(updated_fields).length === 0) {
        throw "You must provide at least one field to update"
    }

    const reviewCollection = await reviews()
    const updateInfo = await reviewCollection.findOneAndUpdate(
        { _id : new ObjectId(id) },
        { $set : updated_fields },
        { returnDocument : "after" }
    );

    if (!updateInfo) {
        throw "Could not update user"
    }

    if(safteyRating){
        //Here we have to update the saftey rating of the location with the new average
    }

    updateInfo._id = updateInfo._id.toString();

    return updateInfo;

}

const removeReview = async (reviewId, userId) => {
    reviewId = checkId(reviewId)
    userId = checkId(userId)
    //Okay we have the userId because we need to make sure that the user is deleting their own review 

    const reviewCollection = await reviews()
    const review = await reviewCollection.findOne({
        _id: new ObjectId(id)
    })
    if (!review) {
        throw "Error: Review not found"
    }
    if (review.userId !== userId){
        throw "Provided user id is not the owner of the review"
    }
    const review_location_id = review.location_id
    const deleteInfo = await reviewCollection.deleteOne({
        _id: new ObjectId(reviewId)
    });
    if (!deleteInfo.deletedCount) {
        throw 'Error: Could not delete review';
    }
    const userCollection = await users()
    const updateUserInfo = await userCollection.updateOne(
        { _id: userId }, 
        { $pull: { reviews: new ObjectId(reviewId) } }
    );

    if (!updateUserInfo) {
        throw "Error could not remove review from user";
    } 

    const locationCollection = await locations()
    const updateLocationInfo = await locationCollection.updateOne(
        { _id: review_location_id }, 
        { $pull: { reviews: new ObjectId(reviewId) } }
    );

    if (!updateUserInfo) {
        throw "Error could not remove review from location";
    } 

    //Then I have to update the new saftey rating 

    return {
        reviewId: reviewId,
        deleted: true
    };

}

export {removeReview, updateReview, getAllReviews, getReviewById, addReview}