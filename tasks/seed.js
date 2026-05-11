import {closeConnection, dbConnection} from '../config/mongoConnection.js';
import {updateUser, removeUser, getUserByEmail, checkUser, addUser, getUserById, getAllUsers, userVisited, addFriend} from '../data/users.js';
import {removeReview, updateReview, getAllReviews, getReviewById, addReview, toggleReviewLike, toggleReviewDislike} from '../data/reviews.js'
import {addLocation, getLocationById, updateLocation, removeLocation, getAllLocations, getLocationsByTag, getLocationsByName, getLocationsByZip, getLocationByFilters} from '../data/locations.js'
import {addComment, getCommentById, getCommentsByReviewId, updateComment, removeComment} from '../data/comments.js'

const db = await dbConnection()
await db.dropDatabase()
let testuser1 = undefined
let testuser2 = undefined
let testuser3 = undefined
let testuser4 = undefined
let testuser5 = undefined
let testuser6 = undefined
let testuser7 = undefined
let testuser8 = undefined
let testuser9 = undefined
let testuser10 = undefined
let testlocation1 = undefined
let testlocation2 = undefined
let testlocation3 = undefined
let testlocation4 = undefined
let testlocation5 = undefined
let testlocation6 = undefined
let testlocation7 = undefined
let testlocation8 = undefined
let testlocation9 = undefined
let testlocation10 = undefined
let testreview1 = undefined
let testreview2 = undefined
let testreview3 = undefined
let testreview4 = undefined
let testreview5 = undefined
let testcomment1 = undefined
let testcomment2 = undefined
let testcomment3 = undefined

//Users ------------------------------------------------------------------------

try {
  testuser1 = await addUser("Nelson", "Bermeo", "nellyb", "nelsonb@gmail.com", "Password123!", "", "25", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser2 = await addUser("Jamil", "Torres", "Jamilly", "jamilcutie@gmail.com", "Password123!123", "", "19", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser3 = await addUser("Ryan", "Johnson", "Rhino", "ryantheJ@gmail.com", "Password123!", "", "19", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser4 = await addUser("Sahil", "Sahilly", "SaucySahil", "sauceboy@gmail.com", "Password123!", "", "20", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser5 = await addUser("Chris", "Bernard", "JuicyNut", "juicynut42@gmail.com", "Password123!", "", "20", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser6 = await addUser("Szymon", "Such", "TheAlpha", "cutefurry12@gmail.com", "Password123!", "", "19", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser7 = await addUser("Jason", "Bhalla", "IndiaIndia", "googleceo@gmail.com", "Password123!", "", "20", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser8 = await addUser("Robort", "Lau", "annoying", "annoying@gmail.com", "Password123!", "", "20", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser9 = await addUser("Patrick", "Hill", "NYCtough", "thehill@gmail.com", "Password123!", "", "20", "SecretAdminKey")
} catch (e) {
  console.log(e)
}
try {
  testuser10 = await addUser("Adien", "Hill", "diamondsword101", "hiller@gmail.com", "Password123!", "", "20", "SecretAdminKey")
} catch (e) {
  console.log(e)
}

//Locations ------------------------------------------------------------------------

try {
  testlocation1 = await addLocation(testuser1, "Albert Park", "2nd street", "07030", {lat: "40.7370", lng: "-74.0280"}, [], ["chill"])
} catch (e) {
  console.log(e)
}
try {
  testlocation2 = await addLocation(testuser2, "Bernards Balls", "1st street", "07030", {lat: "40.7385", lng: "-74.0272"}, [],["park", "kids"])
} catch (e) {
  console.log(e)
}
try {
  testlocation3 = await addLocation(testuser3, "The Spot", "3rd street", "07030", {lat: "40.7401", lng: "-74.0295"}, [],["music"])
} catch (e) {
  console.log(e)
}
try {
  testlocation4 = await addLocation(testuser4, "Night Out Fun", "4th street", "07030", {lat: "40.7418", lng: "-74.0310"}, [],["night", "safe"])
} catch (e) {
  console.log(e)
}
try {
  testlocation5 = await addLocation(testuser5, "Tiktok Rizz Party", "9 Monroe St", "07030", {lat: "40.7432", lng: "-74.0324"}, [],["historic"])
} catch (e) {
  console.log(e)
}
try {
  testlocation6 = await addLocation(testuser6, "Jamil's Juicy Fun Time", "3 Jamil Street", "07030", {lat: "40.7447", lng: "-74.0340"}, [],["study"])
} catch (e) {
  console.log(e)
}
try {
  testlocation7 = await addLocation(testuser7, "Bernards Bowling Ring", "3 Apple Street", "07030", {lat: "40.7461", lng: "-74.0355"}, [],["chill"])
} catch (e) {
  console.log(e)
}
try {
  testlocation8 = await addLocation(testuser8, "Sahil's House", "11th street", "07030", {lat: "40.7475", lng: "-74.0332"}, [],["scenic"])
} catch (e) {
  console.log(e)
}
try {
  testlocation9 = await addLocation(testuser9, "Jeffs Coffee", "5th street", "07030", {lat: "40.7489", lng: "-74.0370"}, [],["study"])
} catch (e) {
  console.log(e)
}
try {
  testlocation10 = await addLocation(testuser10, "Stevens Institute", "One Castle Point Terrace", "07030", {lat: "40.7440", lng: "-74.0258"}, [],["study"])
} catch (e) {
  console.log(e)
}

//Reviews ------------------------------------------------------------------------

try {
  testreview1 = await addReview(testuser1, testlocation2, "Wow Bernard's balls is so amazing and a wonderful place to visit!",[], "2")
} catch (e) {
  console.log(e)
}

try {
  testreview2 = await addReview(testuser3, testlocation4, "This was an amazing and fun night out spot! Me and my friends went supperrr crazy! It's a bit dangerous though.", [],"4")
} catch (e) {
  console.log(e)
}

try {
  testreview3 = await addReview(testuser2, testlocation6, "Jamil's spot is one of a kind, coupled with juice and slime the fun never ends!",[],"5")
} catch (e) {
  console.log(e)
}

try {
  testreview4 = await addReview(testuser5, testlocation8, "Sahil's house was wonderful, he treated me to tea and we watch shrek.",[], "1")
} catch (e) {
  console.log(e)
}

try {
  testreview5 = await addReview(testuser1, testlocation10, "BEST SCHOOL EVER", [], "1")
} catch (e) {
  console.log(e)
}

//Reviews ------------------------------------------------------------------------

try {
  testcomment1 = await addComment(testreview1, testuser5, "Yeah, totally agree this place is the perfect mix of comfort and juciyness")
} catch (e) {
  console.log(e)
}

try {
  testcomment2 = await addComment(testreview3, testuser1, "I'd have to disagree my time here was lackluster as I was promised a juicy little pony to the waterfront but jamil never fell through")
} catch (e) {
  console.log(e)
}

try {
  testcomment3 = await addComment(testreview4, testuser4, "why are you in my house this never happened")
} catch (e) {
  console.log(e)
}





await closeConnection();
