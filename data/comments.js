// import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
// import validation package or functions

const getAllUsers = async () => {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray(); 
    return userList; 
    // Will this return a list of jsons? Idk. 
} 