// import {users} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'
import { checkId, checkString, checkNumericString, check_chars_1, check_chars_2, check_length, check_number_range} from "./validation.js"
// import validation package or functions

const DEFAULT_PROFILE_PICTURE = "/public/images/default-profile.jpg";

const getAllUsers = async () => {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray(); 
    return userList; 
    // Will this return a list of jsons? Idk. 
} 

const getUserById = async (id) => {
    id = checkId(id, "getUserById Id");
    const userCollection = await users();
    const user = await userCollection.findOne
}

export const addUser = async (
    //Things we need to check: 
    // 1) Length of everything 
    first_name,
    last_name,
    usernameInput,
    emailInput,
    password,
    // reviews, Gets added whenever they write a review 
    // friends_list, Gets added whenever they make a friend
    // visited_locations_list, Gets added whenever they visit a location
    // public_lists, Gets added whenever they create a list
    profile_picture, 
    // achievements, Gets added whenever they do things
    // added_locations_list, Gets added whenever they create their own location
    age
) => {
    first_name = checkString(first_name)
    last_name = checkString(last_name)
    // username = checkString(username)
    // email = checkString(email)
    password = checkString(password)
    // profile_picture = checkString(profile_picture)
    age = checkNumericString(age)

    first_name = first_name.toLowerCase()
    check_length(first_name, 1, 50)
    check_chars_1(first_name)
    last_name = last_name.toLowerCase()
    check_length(first_name, 1, 50)
    check_chars_1(last_name)
    //First & Last name must be 1 - 50 chars and include only letters, spaces, hyphens, apostrophies
    //Should find some documentation on the "right" number of chars for name but this will do for now
    //We could add regex method to account for names from other langugaes, but perhaps we could run into problems with this later so we'll save it 

    usernameInput = usernameInput.toLowerCase()
    check_length(usernameInput, 3, 20)
    check_chars_2(usernameInput)
    //User name will be 3 - 20 characters and include only letters, numbers and underscore. We will compare uniquness with lowercase version to be case insensitive because users could forget capitalization
    //Then we have to check if the username is in the database 
    const userCollection = await users();
    
    let usernameUser = await userCollection.findOne({ username: usernameInput })

    if (usernameUser){
        // Username is taken
        throw "Error: Username in use."
    }

    emailInput = emailInput.toLowerCase()
    check_length(emailInput, 3, 100) //email format check will probably deal with min length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    //The / wrap the regex pattern, the ^ and $ means we are parsing the whole string, and we have 3 sections _ @ _ . _ where each section can have whatever since we have the ^ aka not
    if (!(emailRegex.test(emailInput))){
        throw "Error: Invalid email address"
    }
    //Email idk fr fr for security purposes I guess we'll put 100 for now. Then we check if it's proper email format and then check if it's unique
    //To check format apparently we can use this thing called regex 
    let emailUser = await userCollection.findOne({ email: emailInput })

    if (emailUser){
        // email is taken
        throw "Error: Email in use."
    }

    check_length(password, 8, 64)
    if (!/[A-Z]/.test(password)) throw "Error: Password must contain at least one uppercase letter" 
    if (!/[a-z]/.test(password)) throw "Error: Password must contain at least one lowercase letter" 
    if (!/[0-9]/.test(password)) throw "Error: Password must contain at least one number" 
    if (!/[^A-Za-z0-9]/.test(password)) throw "Error: Password must contain at least one special character" 
    const hashed_password = await bcrypt.hash(password, 10) //10 salt rounds seems fine
    //Passowrd must be at least 8 chars and at most 64, at least 1 uppercase, at least one lowercase, at least one number, at least one special chracter. Instead of a big stupid for loop we can actually use the regex syntax learned above 

    const parsedAge = Number(age)
    check_number_range(parsedAge, 13, 120)
    // Age should be a number, at least 13 and at most 120, 


    if (profile_picture === undefined || profile_picture === null || profile_picture.trim() === "" ){
        profile_picture = DEFAULT_PROFILE_PICTURE
    } else {
        profile_picture = profile_picture.trim()
    }
    // profile picture is optional; maybe I should check if they uploaded a valid path

    const newUser = {
        "first_name" : first_name, 
        "last_name" : last_name,
        "username" : usernameInput,
        "email" : emailInput,
        "password" : hashed_password,
        "reviews" : [], 
        "friends_list" : [],
        "visited_locations_list" : [],
        "public_lists" : [],
        "profile_picture" : profile_picture, 
        "achievements" : [],
        "added_locations_list" : [],
        "age" : age,
        "role" : "user"
    }

    const insertInfo = await userCollection.insertOne(newUser)
    if (!insertInfo.insertedId || !insertInfo.acknowledged ) throw "Error: Insert Failed"
    return insertInfo.insertedId
}