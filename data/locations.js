import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'
import { checkId, checkString, checkNumericString, check_chars_1, check_chars_2, check_length, check_number_range} from "./validation.js"

const addLocation = async (
    userId, 
    name, // we forgot to include the name for the location in our db proposal
    address,
    zipcode, // Since many addresses are similar we need a zipcode to differentiate them
    coordinates, // we can store these as a dict
    // poster, we only need the user id not the username
    pictures,
    reviews,
    likes,
    dislikes,
    tags, 
    average_saftey_rating,
) => {
    userId = checkId(userId) // Must exist, be a string, be a ObjectId, must belong to a real user 
    const userCollection = await users()
    let userIdCheck = await userCollection.findOne({ id : userId })
    if (!userIdCheck){
        throw "Error: User ID does not exist"
    }

    name = checkString(name) 
    check_length(name, 1, 100)
    //check_chars
    //Name must be 1 - 100 chars, and what should only include letters, numbers, spaces, and apostrophes? 

    address = checkString(address)
    check_length(address, 5, 200)
    //regex
    //Address, we can have a address format with regex perhaps, 5 - 200 chars?, 

    zipcode = checkString(zipcode)
    checkNumericString(zipcode)
    check_length(zipcode, 5, 5)

    //coordinates would be modeled like: 
    //coordinates : { lat: 30.2039, lng: 23.3421 }
    //must be an object, must have lat and lng,
    // lat and lng must be valid number from -90 -> 90 & -180 -> 180 
    //Later we could restrict our app to only hold hoboken spots

}