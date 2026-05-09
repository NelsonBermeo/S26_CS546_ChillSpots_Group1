import { closeConnection, dbConnection } from '../config/mongoConnection.js';
import {updateUser, removeUser, getUserByEmail, checkUser, addUser, getUserById, getAllUsers} from '../data/users.js';

const db = await dbConnection()
await db.dropDatabase()
let testuser = undefined
let allusers = undefined
let testGetId = undefined
let testGetEmail = undefined
let checkUserF = undefined
let testuserupdate = undefined

try {
  testuser = await addUser("nelson", "bermeo", "nellyb", "nelsonb@gmail.com", "Password123!", "profile_picture", "20")
  console.log(testuser)
} catch (e) {
  console.log(e)
}
try {
  allusers = await getAllUsers()
  console.log(allusers)
} catch (e) {
  console.log(e)
}
console.log("---------------------------------------")
try {
  testGetId = await getUserById(testuser)
  testGetEmail = await getUserByEmail(testGetId.email)
  console.log(testGetEmail)
} catch (e) {
  console.log(e)
}

console.log("---------------------------------------")
try {
  checkUserF = await checkUser("nelsonb@gmail.com", "Password123!")
  console.log(checkUserF)
} catch (e) {
  console.log(e)
}

console.log("---------------------------------------")

try {
  testuserupdate = await updateUser(testuser, "", "bernard", "nelsonbernard")
  console.log(testuserupdate)
} catch (e) {
  console.log(e)
}




await closeConnection();
