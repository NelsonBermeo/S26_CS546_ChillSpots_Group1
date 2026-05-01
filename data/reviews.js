import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'
import { checkId, checkString, checkNumericString, check_chars_1, check_chars_2, check_length, check_number_range} from "./validation.js"
// import validation package or functions

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
    checkId(userId) // Must exist, be a string, be a ObjectId, must belong to a real user 
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