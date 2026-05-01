// import {users} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { checkId } from "./validation.js"
// import validation package or functions

const getAllUsers = async () => {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray(); 
    return userList; 
    // Will this return a list of jsons? Idk. 
} 

const getUserById = async (id) => {
    id = validation.checkId(id, "getUserById Id");
    const userCollection = await users();
    const user = await userCollection.findOne
}