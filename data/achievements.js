import { ObjectId } from 'mongodb';
import { users, locations, reviews } from '../config/mongoCollections.js';
import { checkId } from '../validation.js';

// all possible achievements and what triggers them
const ACHIEVEMENTS = {
    // registration
    'Welcome to ChillSpots!': 'Awarded for registering an account',

    // visiting spots
    'Larper': 'Visited 10 spots',
    'Adventurer': 'Visited 50 spots',
    'ChillSpotter': 'Visited 100 spots',

    // review likes
    '1st Base': 'Got 10 likes on a review',
    'Goated': 'Got 50 likes on a review',
    'Superstar': 'Got 100 likes on a review',

    // writing reviews
    'First Review': 'Wrote your first review',
    'Critic': 'Wrote 10 reviews',
    'Expert Critic': 'Wrote 25 reviews',
    'Master Critic': 'Wrote 50 reviews',

    // adding locations
    'Scout': 'Added your first location',
    'On the come up': 'Had a location you posted reach 10 likes',
    'W Larp': 'Had a location you posted reach 50 likes',

    // public lists
    'List Maker': 'Created your first public list',
    'Curator': 'Had a public list with 10 or more locations',

    // variety
    'Jack of All Spots': 'Visited spots with 5 different tags'
};

//adds an achievement if they dont already have it
const giveAchievement = async (userId, achievement) => {
    if (!ACHIEVEMENTS[achievement]) throw `Error: Unknown achievement: ${achievement}`;
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'Error: User not found';

    //doesnt give duplicate achievements
    if (user.achievements.includes(achievement)) return user;

    const updated = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $push: { achievements: achievement } },
        { returnDocument: 'after' }
    );
    return updated;
};

//calls this after a user registers
const checkRegisterAchievements = async (userId) => {
    userId = checkId(userId, 'userId');
    await giveAchievement(userId, 'Welcome to ChillSpots!');
};

//calls this after a user marks a location as visited
const checkVisitedAchievements = async (userId) => {
    userId = checkId(userId, 'userId');
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'Error: User not found';

    const visitCount = user.visited_locations_list.length;
    if (visitCount >= 10) await giveAchievement(userId, 'Larper');
    if (visitCount >= 50) await giveAchievement(userId, 'Adventurer');
    if (visitCount >= 100) await giveAchievement(userId, 'ChillSpotter');

    //checks for variety achievement: visited spots with 5 different tags
    const locationCollection = await locations();
    const visitedIds = user.visited_locations_list.map((id) => new ObjectId(id));
    const visitedLocations = await locationCollection.find({ _id: { $in: visitedIds } }).toArray();

    const tagsSeen = [];
    for (let i = 0; i < visitedLocations.length; i++) {
        for (let j = 0; j < visitedLocations[i].tags.length; j++) {
            const tag = visitedLocations[i].tags[j];
            if (!tagsSeen.includes(tag)) {
                tagsSeen.push(tag);
            }
        }
    }
    if (tagsSeen.length >= 5) await giveAchievement(userId, 'Jack of All Spots');
};

//calls this after a user posts a review
const checkReviewAchievements = async (userId) => {
    userId = checkId(userId, 'userId');
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'Error: User not found'
    const reviewCount = user.reviews.length;
    if (reviewCount >= 1) await giveAchievement(userId, 'First Review');
    if (reviewCount >= 10) await giveAchievement(userId, 'Critic');
    if (reviewCount >= 25) await giveAchievement(userId, 'Expert Critic');
    if (reviewCount >= 50) await giveAchievement(userId, 'Master Critic');
};

//calls this after a review gets a like, looks up the review to get owner and like count
const checkReviewLikeAchievements = async (reviewId) => {
    reviewId = checkId(reviewId, 'reviewId');
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({ _id: new ObjectId(reviewId) });
    if (!review) throw 'Error: Review not found';
    const userId = review.user_id.toString();
    const reviewLikes = review.likes || 0;
    if (reviewLikes >= 10) await giveAchievement(userId, '1st Base');
    if (reviewLikes >= 50) await giveAchievement(userId, 'Goated');
    if (reviewLikes >= 100) await giveAchievement(userId, 'Superstar');
};

//calls this after a user adds a location
const checkLocationAchievements = async (userId) => {
    userId = checkId(userId, 'userId');
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'Error: User not found';

    if (user.added_locations_list.length >= 1) await giveAchievement(userId, 'Scout');
};

//calls this after a location gets a like, looks up the location to get owner and like count
const checkLocationLikeAchievements = async (locationId) => {
    locationId = checkId(locationId, 'locationId');
    const locationCollection = await locations();
    const location = await locationCollection.findOne({ _id: new ObjectId(locationId) });
    if (!location) throw 'Error: Location not found';
    const userId = location.userId.toString();
    const locationLikes = location.likes || 0;
    if (locationLikes >= 10) await giveAchievement(userId, 'On the come up');
    if (locationLikes >= 50) await giveAchievement(userId, 'W Larp');
};

//calls this after a user creates a public list
const checkListAchievements = async (userId, listLocationCount) => {
    userId = checkId(userId, 'userId');
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'Error: User not found';

    if (user.public_lists.length >= 1) await giveAchievement(userId, 'List Maker');
    if (listLocationCount >= 10) await giveAchievement(userId, 'Curator');
};

export {
    ACHIEVEMENTS,
    checkRegisterAchievements,
    checkVisitedAchievements,
    checkReviewAchievements,
    checkReviewLikeAchievements,
    checkLocationAchievements,
    checkLocationLikeAchievements,
    checkListAchievements
};
