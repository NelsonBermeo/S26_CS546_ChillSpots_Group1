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
    // reviews, we dont add reviews here 
    // likes, we dont add lkes her e
    // dislikes, we dont add dislikes  here 
    tags, 
    //average_saftey_rating,
) => {
    userId = checkId(userId) // Must exist, be a string, be a ObjectId, must belong to a real user 
    const userCollection = await users()
    let userIdCheck = await userCollection.findOne({ id : userId })
    if (!userIdCheck){
        throw "Error: User ID does not exist"
    }

    name = checkString(name) 
    check_length(name, 1, 100)
    const locationNameRegex = /^[A-Za-z0-9 .'-]+$/; //The + one or more and the $ means we end the regex 
    if (!locationNameRegex.test(name)) { 
        throw "Error: Name is no correct" 
    }

    //check_chars
    //Name must be 1 - 100 chars, and what should only include letters, numbers, spaces, and apostrophes and hyphens? 
    //Regex is so much simpler than the helper function: 
    //


    address = checkString(address)
    check_length(address, 5, 200)
    const addressRegex = 
    /^[A-Za-z0-9 .,'#&()\/\-]+$/;
    // /^
    // [A-Za-z0-9 .,'#&()\/\-] //We can include all of these characters  
    // This could eleminiate <script> :D from happening 
    // + - The plus means one or more of the characters 
    // $/;
    if (!addressRegex.test(address)) { 
        throw "Error: Name is no correct" 
    }
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

    if (!coordinates){
        throw "Coordinates does not exist"
    }
    if (typeof coordinates !== 'object' || val === null || Array.isArray(coordinates)) { 
        throw "Coordinates is not an object"
    }
    if (!coordinates.lat){
        throw "Coordinates must contain latitude"
    }
    if (!coordinates.lng){
        throw "Coordinates must contain longitude"
    }
    checkNumericString(coordinates.lat)
    checkNumericString(coordinates.lng)

    let lat = Number(coordinates.lng)
    let long = Number(coordinates.lng)

    check_number_range(coordinates.lat, -90, 90)
    check_number_range(coordinates.lng, -180, 180)

    //We have the zipcode and coords so let's make sure we don't already have this location in db 

    const locationCollection = await locations()
    const location = await locationCollection.findOne(
        { "address" : address, "zipcode" : zipcode }
    );
    if (location) throw 'Error: Location already in db';

    //Images 
    if (!pictures){
        //whatever
    }

    //tags 
    const allowedTags = [
        "park",
        "pier",
        "lake",
        "river",
        "beach",
        "quiet",
        "calm",
        "scenic",
        "view",
        "sunset",
        "nature",
        "walk",
        "hike",
        "trail",
        "grass",
        "trees",
        "garden",
        "picnic",
        "study",
        "date",
        "friends",
        "family",
        "food",
        "coffee",
        "shops",
        "photo",
        "skyline",
        "water",
        "fishing",
        "sports",
        "bike",
        "dog",
        "kids",
        "safe",
        "crowded",
        "hidden",
        "relax",
        "urban",
        "open",
        "shade",
        "sunny",
        "benches",
        "free",
        "clean",
        "music",
        "art",
        "historic",
        "night",
        "morning",
        "chill"
    ]
    if (!Array.isArray(tags)) throw "Error: Tags must be an array"
    if (tags.length > 10) throw "Error: A location can have at most 10 tags"
    for (let i = 0; i < tags.length; i++){
        tags[i] = checkString(tags[i])
        check_length(tags[i], 1, 10)
        if (!allowedTags.includes(tags[i])){
            throw "Error: Tag is not allowed"
        }
    }

    const newLocation = {
        "userId": userId, 
        "name": name,
        "address": address,
        "zipcode": zipcode,
        "coordinates": coordinates, 
        "pictures": [],
        "reviews": [],
        "likes": 0,
        "dislikes": 0,
        "tags": tags, 
        "average_saftey_rating": 0
    }

    const insertInfo = await locationCollection.insertOne(newLocation)
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw "Error: Could not add location"
    }

    const updateUserInfo = await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { added_locations_list: insertInfo.insertedId } }
    );

    if (updateUserInfo.modifiedCount === 0) {
        throw "Error: Could not add location to user's added locations list"
    }

    return insertInfo
}

const getLocationById = async (locationId) => {
    
}

const updateLocation = async (locationId) => {

}

const removeLocation = async (locatoinId) => {

}

const getAllLocations = async () => {

}
