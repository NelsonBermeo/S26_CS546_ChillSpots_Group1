import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'
import { checkId, checkString, checkNumericString, check_chars_1, check_chars_2, check_length, check_number_range} from "../validation.js"
import {reviews, users, locations} from '../config/mongoCollections.js';

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
    let userIdCheck = await userCollection.findOne({ _id : new ObjectId(userId) })
    if (!userIdCheck){
        throw "Error: User ID does not exist"
    }

    location_id = checkId(location_id) //Must exist, be a string, be a ObjectId, must belong to locations collection
    const locationCollection = await locations()
    let locationIdCheck = await locationCollection.findOne({ _id : new ObjectId(location_id) })
    if (!locationIdCheck){
        throw "Error: Location ID does not exist"
    }

    content = checkString(content)
    check_length(content, 1, 1000)
    //Our content can be 1 - 1000 characters for now and can contain any char

    // pictures =  
    // Optional, must be an array, each item must be a non empty string, each item should be a valid URL or image path, max 5 pictues

    safteyRating = checkNumericString(safteyRating)
    const parseSafteyRating = Number(safteyRating)
    check_number_range(parseSafteyRating, 1, 5)
    //Optional, must be a number between 1 and 5.

    if (!Array.isArray(pictures)){
        throw "Error: Pictures must be an array."
    } 
    for (let i = 0; i < pictures.length; i++) { 
        pictures[i] = checkString(pictures[i]);
        check_length(pictures[i], 1, 1000)
    }   


    const newReview = {
        "user_id" : new ObjectId(userId),
        "username" : userIdCheck.username,
        "location_id" : new ObjectId(location_id),
        "content" : content,
        "pictures": pictures, //empty for now
        "likes" : 0,
        "disikes" : 0,
        "date" : new Date(), //instant date
        "safteyRating" : parseSafteyRating,
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

    await userCollection.updateOne( { _id: new ObjectId(userId)}, { $push: {reviews: reviewId.toString() }})

    //Then we have to add this review to the location we added it to: 

    await locationCollection.updateOne( { _id : new ObjectId( location_id ) }, { $push : { reviews : reviewId.toString() } } )
    
    
    const reviewsForLocation = await reviewCollection.find({ location_id: new ObjectId( location_id ) }).toArray()
    let sum = 0
    for (let review of reviewsForLocation) {
        sum += review.safteyRating
    }
    
    let average = reviewsForLocation.length === 0 ? 0 : sum / reviewsForLocation.length

    await locationCollection.updateOne( { _id : new ObjectId( location_id ) }, { $set : { average_saftey_rating : average } } )

    return reviewId.toString()

}

const getReviewById = async (id) => {
    id = checkId(id)
    const reviewCollection = await reviews()
    const review = await reviewCollection.findOne({
        _id: new ObjectId(id)
    })
    if (!review) {
        throw "Error: Review not found"
    }
    return review
}

const getAllReviews = async () => {
    const reviewCollection = await reviews();
    let reviewList = await reviewCollection.find({}).toArray(); 
    return reviewList;
}

const updateReview = async (id, content, safteyRating) => {
    id = checkId(id)
    let updated_fields = {}

    if (content){
        content = checkString(content)
        check_length(content, 1, 1000)
        updated_fields.content = content
    }

    // if (pictures){
    //     //Deal with later
    // }

    if(safteyRating){
        safteyRating = checkNumericString(safteyRating)
        const parseSafteyRating = Number(safteyRating)
        check_number_range(parseSafteyRating, 1, 5)
        updated_fields.safteyRating = parseSafteyRating
    }

    if (Object.keys(updated_fields).length === 0) {
        throw "You must provide at least one field to update"
    }

    const reviewCollection = await reviews()
    let curr_rev = await reviewCollection.findOne({_id : new ObjectId(id)})
    let curr_rev_rating = curr_rev.safteyRating
    const updateInfo = await reviewCollection.findOneAndUpdate(
        { _id : new ObjectId(id) },
        { $set : updated_fields },
        { returnDocument : "after" }
    );

    if (!updateInfo) {
        throw "Could not update user"
    }

    if(safteyRating){
        safteyRating = checkNumericString(safteyRating)
        const parseSafteyRating = Number(safteyRating)
        check_number_range(parseSafteyRating, 1, 5)

        const locationCollection = await locations()
        let rev = await getReviewById(id)

        const reviewsForLocation = await reviewCollection.find({ location_id: new ObjectId( rev.location_id ) }).toArray()
        let sum = 0
        for (let review of reviewsForLocation) {
            sum += review.safteyRating
            }
        let average = reviewsForLocation.length === 0 ? 0 : sum / reviewsForLocation.length;
        
        await locationCollection.updateOne( { _id : new ObjectId( rev.location_id ) }, { $set : { average_saftey_rating : average } } )
    }

    // updateInfo._id = updateInfo._id.toString();

    return updateInfo;

}

const removeReview = async (reviewId, userId) => {
    reviewId = checkId(reviewId)
    userId = checkId(userId)
    //Okay we have the userId because we need to make sure that the user is deleting their own review 

    const reviewCollection = await reviews()
    const review = await reviewCollection.findOne({
        _id: new ObjectId(reviewId)
    })
    if (!review) {
        throw "Error: Review not found"
    }
    if (review.user_id.toString() !== userId){
        throw "Provided user id is not the owner of the review"
    }
    const review_location_id = review.location_id.toString()
    const deleteInfo = await reviewCollection.deleteOne({
        _id: new ObjectId(reviewId)
    });
    if (!deleteInfo.deletedCount) {
        throw 'Error: Could not delete review';
    }
    const userCollection = await users()
    const updateUserInfo = await userCollection.updateOne(
        { _id: new ObjectId(userId) }, 
        { $pull: { reviews: reviewId } }
    );

    if (!updateUserInfo) {
        throw "Error could not remove review from user";
    } 

    const locationCollection = await locations()
    const updateLocationInfo = await locationCollection.updateOne(
        { _id: new ObjectId(review_location_id) }, 
        { $pull: { reviews: reviewId } }
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