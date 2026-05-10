import { ObjectId } from 'mongodb';
import { publicLists, users, locations } from '../config/mongoCollections.js';
import { checkId, checkString, checkStringArray, check_length } from '../validation.js';

const VALID_TAGS = [
  'park','pier','lake','river','beach','quiet', 'calm', 'scenic',
  'view','sunset','nature','walk','hike','trail', 'grass', 'trees',
  'garden','picnic','study','date','friends','family','food',
  'coffee','shops','photo','skyline','water','fishing','sports',
  'bike','dog','kids','safe','crowded','hidden','relax','urban',
  'open','shade','sunny','benches','free','clean','music','art',
  'historic','night','morning','chill'
];

const createList = async (user_id, name, location_list, tags) => {
  user_id = checkId(user_id, 'user_id');
  name = checkString(name, 'name');
  check_length(name, 1, 100);
  //verifies user exists
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(user_id) });
  if (!user) throw 'Error: User not found';
  if (location_list === undefined || location_list === null) {
    location_list = [];
  }
  if (!Array.isArray(location_list)) throw 'Error: location_list must be an array';
  const validatedLocations = [];
  if (location_list.length > 0) {
    const locationCollection = await locations();
    for (const locId of location_list) {
      const checkedId = checkId(locId, 'location_list item');
      const location = await locationCollection.findOne({ _id: new ObjectId(checkedId) });
      if (!location) throw `Error: Location ${checkedId} not found`;
      validatedLocations.push(new ObjectId(checkedId));
    }
  }
  if (tags === undefined || tags === null) {
    tags = [];
  }
  if (!Array.isArray(tags)) throw 'Error: tags must be an array';
  if (tags.length > 10) throw 'Error: Cannot have more than 10 tags';
  tags = checkStringArray(tags, 'tags');
  tags = tags.map((t) => t.toLowerCase());
  for (const tag of tags) {
    if (!VALID_TAGS.includes(tag)) throw `Error: Invalid tag "${tag}"`;
  }
  const newList = {
    user_id: new ObjectId(user_id),
    name,
    location_list: validatedLocations,
    tags
  };
  const listCollection = await publicLists();
  const insertInfo = await listCollection.insertOne(newList);
  if (!insertInfo.insertedId || !insertInfo.acknowledged) {
    throw 'Error: Could not create list';
  }
  //adds list id to the user's public_lists array
  await userCollection.updateOne(
    { _id: new ObjectId(user_id) },
    { $push: { public_lists: insertInfo.insertedId } }
  );
  return await getListById(insertInfo.insertedId.toString());
};

const getListById = async (listId) => {
  listId = checkId(listId, 'listId');
  const listCollection = await publicLists();
  const list = await listCollection.findOne({ _id: new ObjectId(listId) });
  if (!list) throw 'Error: List not found';
  return _stringifyIds(list);
};

const getListsByUserId = async (user_id) => {
  user_id = checkId(user_id, 'user_id');
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(user_id) });
  if (!user) throw 'Error: User not found';
  const listCollection = await publicLists();
  const userLists = await listCollection
    .find({ user_id: new ObjectId(user_id) })
    .toArray();
  return userLists.map(_stringifyIds);
};

const getAllLists = async () => {
  const listCollection = await publicLists();
  const allLists = await listCollection.find({}).toArray();
  return allLists.map(_stringifyIds);
};

const updateList = async (listId, user_id, updates) => {
  listId = checkId(listId, 'listId');
  user_id = checkId(user_id, 'user_id');
  const listCollection = await publicLists();
  const list = await listCollection.findOne({ _id: new ObjectId(listId) });
  if (!list) throw 'Error: List not found';
  if (list.user_id.toString() !== user_id) throw 'Error: You can only edit your own lists';
  const updated_fields = {};
  if (updates.name !== undefined) {
    updates.name = checkString(updates.name, 'name');
    check_length(updates.name, 1, 100);
    updated_fields.name = updates.name;
  }
  if (updates.tags !== undefined) {
    if (!Array.isArray(updates.tags)) throw 'Error: tags must be an array';
    if (updates.tags.length > 10) throw 'Error: Cannot have more than 10 tags';
    updates.tags = checkStringArray(updates.tags, 'tags');
    updates.tags = updates.tags.map((t) => t.toLowerCase());
    for (const tag of updates.tags) {
      if (!VALID_TAGS.includes(tag)) throw `Error: Invalid tag "${tag}"`;
    }
    updated_fields.tags = updates.tags;
  }
  if (Object.keys(updated_fields).length === 0) {
    throw 'Error: You must provide at least one field to update';
  }
  const updateInfo = await listCollection.findOneAndUpdate(
    { _id: new ObjectId(listId) },
    { $set: updated_fields },
    { returnDocument: 'after' }
  );
  if (!updateInfo) throw 'Error: Could not update list';
  return _stringifyIds(updateInfo);
};

const addLocationToList = async (listId, user_id, locationId) => {
  listId = checkId(listId, 'listId');
  user_id = checkId(user_id, 'user_id');
  locationId = checkId(locationId, 'locationId');
  const listCollection = await publicLists();
  const list = await listCollection.findOne({ _id: new ObjectId(listId) });
  if (!list) throw 'Error: List not found';
  if (list.user_id.toString() !== user_id) throw 'Error: You can only edit your own lists';
  //checks location exists
  const locationCollection = await locations();
  const location = await locationCollection.findOne({ _id: new ObjectId(locationId) });
  if (!location) throw 'Error: Location not found';
  //checks not already in list
  const alreadyIn = list.location_list.some(
    (id) => id.toString() === locationId
  );
  if (alreadyIn) throw 'Error: Location is already in this list';
  await listCollection.updateOne(
    { _id: new ObjectId(listId) },
    { $push: { location_list: new ObjectId(locationId) } }
  );
  return await getListById(listId);
};

const removeLocationFromList = async (listId, user_id, locationId) => {
  listId = checkId(listId, 'listId');
  user_id = checkId(user_id, 'user_id');
  locationId = checkId(locationId, 'locationId');
  const listCollection = await publicLists();
  const list = await listCollection.findOne({ _id: new ObjectId(listId) });
  if (!list) throw 'Error: List not found';
  if (list.user_id.toString() !== user_id) throw 'Error: You can only edit your own lists';
  const exists = list.location_list.some((id) => id.toString() === locationId);
  if (!exists) throw 'Error: Location is not in this list';
  await listCollection.updateOne(
    { _id: new ObjectId(listId) },
    { $pull: { location_list: new ObjectId(locationId) } }
  );
  return await getListById(listId);
};

const removeList = async (listId, user_id) => {
  listId = checkId(listId, 'listId');
  user_id = checkId(user_id, 'user_id');
  const listCollection = await publicLists();
  const list = await listCollection.findOne({ _id: new ObjectId(listId) });
  if (!list) throw 'Error: List not found';
  if (list.user_id.toString() !== user_id) throw 'Error: You can only delete your own lists';
  const deleteInfo = await listCollection.deleteOne({ _id: new ObjectId(listId) });
  if (!deleteInfo.deletedCount) throw 'Error: Could not delete list';
  //removes list id from the user's public_lists array
  const userCollection = await users();
  await userCollection.updateOne(
    { _id: new ObjectId(user_id) },
    { $pull: { public_lists: new ObjectId(listId) } }
  );
  return { listId, deleted: true };
};

const getLocationsNotInList = async (listId) => {
  listId = checkId(listId, 'listId');
  const listCollection = await publicLists();
  const list = await listCollection.findOne({ _id: new ObjectId(listId) });
  if (!list) throw 'Error: List not found';
  const locationCollection = await locations();
  const available = await locationCollection
    .find({ _id: { $nin: list.location_list } })
    .toArray();
  return available.map((loc) => {
    loc._id = loc._id.toString();
    return loc;
  });
};

const _stringifyIds = (list) => {
  list._id = list._id.toString();
  list.user_id = list.user_id.toString();
  list.location_list = list.location_list.map((id) => id.toString());
  return list;
};

export {
  createList,
  getListById,
  getListsByUserId,
  getAllLists,
  updateList,
  addLocationToList,
  removeLocationFromList,
  removeList,
  getLocationsNotInList
};

