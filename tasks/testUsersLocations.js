import { closeConnection, dbConnection } from '../config/mongoConnection.js';
import {updateUser, removeUser, getUserByEmail, checkUser, addUser, getUserById, getAllUsers} from '../data/users.js';
// import {removeReview, updateReview, getAllReviews, getReviewById, addReview} from '../data/reviews.js'
import {addLocation, getLocationById, updateLocation, removeLocation, getAllLocations, getLocationsByTag, getLocationsByName, getLocationsByZip} from '../data/locations.js'

const db = await dbConnection()
await db.dropDatabase()
let testuser = undefined
let testlocation = undefined
let testlocation2 = undefined
let testlocation3 = undefined


let tagLoco = undefined
// let testreview = undefined
// let allusers = undefined
let testGetId = undefined
// let testGetEmail = undefined
// let checkUserF = undefined
// let testuserupdate = undefined
let testlocationupdate = undefined
let hideuser = 0

try {
  testuser = await addUser("nelson", "bermeo", "nellyb", "nelsonb@gmail.com", "Password123!", "profile_picture", "20")
  console.log(testuser)
} catch (e) {
  console.log(e)
}

if (hideuser){
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
}

try {
  testlocation = await addLocation(testuser, "Bernards Balls", "1st street", "12345", {lat: "90", lng: "140"}, ["park", "park"])
  console.log(testlocation)
} catch (e) {
  console.log(e)
}

try {
  testGetId = await getLocationById(testlocation)
  console.log(testGetId)
} catch (e) {
  console.log(e)
}
// try {
//   testlocation2 = await addLocation(testuser, "Bernards Balls", "1st street", "12345", {lat: "90", lng: "140"}, ["park", "park"])
//   console.log(testlocation2)
// } catch (e) {
//   console.log(e)
// }
// try {
//   testlocation3 = await addLocation(testuser, "Bernards Balls", "1st street", "12345", {lat: "90", lng: "140"}, ["park", "park"])
//   console.log(testlocation3)
// } catch (e) {
//   console.log(e)
// }

console.log("------------------Locos by zip---------------------")
try {
  tagLoco = await getLocationsByZip("12345")
  console.log(tagLoco)
} catch (e) {
  console.log(e)
}

// try {
//   testreview = await addReview(testuser, "bermeo", "nellyb", "nelsonb@gmail.com", "Password123!", "profile_picture", "20")
//   console.log(testuser)
// } catch (e) {
//   console.log(e)
// }


await closeConnection();
