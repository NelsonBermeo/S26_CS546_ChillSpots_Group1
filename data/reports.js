import { ObjectId } from 'mongodb';
import { reports, users, locations, reviews, comments } from '../config/mongoCollections.js';
import { checkId, checkString, check_length } from '../validation.js';

const VALID_TYPES = ['location', 'review', 'comment'];

const addReport = async (reporterId, item_id, type, content) => {
  reporterId = checkId(reporterId, 'reporterId');
  item_id = checkId(item_id, 'item_id');
  type = checkString(type, 'type').toLowerCase();
  content = checkString(content, 'content');
  check_length(content, 1, 500);
  if (!VALID_TYPES.includes(type)) {
    throw `Error: type must be one of: ${VALID_TYPES.join(', ')}`;
  }

  //verifies reporter exists
  const userCollection = await users();
  const reporter = await userCollection.findOne({ _id: new ObjectId(reporterId) });
  if (!reporter) throw 'Error: Reporter user not found';

  //verifies the target item exists
  if (type === 'location') {
    const locationCollection = await locations();
    const location = await locationCollection.findOne({ _id: new ObjectId(item_id) });
    if (!location) throw 'Error: Location not found';
  } else if (type === 'review') {
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({ _id: new ObjectId(item_id) });
    if (!review) throw 'Error: Review not found';
  } else if (type === 'comment') {
    const commentCollection = await comments();
    const comment = await commentCollection.findOne({ _id: new ObjectId(item_id) });
    if (!comment) throw 'Error: Comment not found';
  }

  //prevents duplicate reports from the same user on the same item
  const reportCollection = await reports();
  const existing = await reportCollection.findOne({
    reporterId: new ObjectId(reporterId),
    item_id: new ObjectId(item_id)
  });
  if (existing) throw 'Error: You have already reported this item';
  const newReport = {
    reporterId: new ObjectId(reporterId),
    type,
    item_id: new ObjectId(item_id),
    content
  };

  const insertInfo = await reportCollection.insertOne(newReport);
  if (!insertInfo.insertedId || !insertInfo.acknowledged) {
    throw 'Error: Could not submit report';
  }
  return await getReportById(insertInfo.insertedId.toString());
};

const getReportById = async (reportId) => {
  reportId = checkId(reportId, 'reportId');
  const reportCollection = await reports();
  const report = await reportCollection.findOne({ _id: new ObjectId(reportId) });
  if (!report) throw 'Error: Report not found';
  return _stringifyIds(report);
};

const getAllReports = async () => {
  const reportCollection = await reports();
  const reportList = await reportCollection.find({}).toArray();
  return reportList.map(_stringifyIds);
};
const getReportsByType = async (type) => {
  type = checkString(type, 'type').toLowerCase();
  if (!VALID_TYPES.includes(type)) {
    throw `Error: type must be one of: ${VALID_TYPES.join(', ')}`;
  }
  const reportCollection = await reports();
  const reportList = await reportCollection.find({ type }).toArray();
  return reportList.map(_stringifyIds);
};
const getReportsByItemId = async (item_id) => {
  item_id = checkId(item_id, 'item_id');
  const reportCollection = await reports();
  const reportList = await reportCollection
    .find({ item_id: new ObjectId(item_id) })
    .toArray();
  return reportList.map(_stringifyIds);
};
const removeReport = async (reportId) => {
  reportId = checkId(reportId, 'reportId');
  const reportCollection = await reports();
  const report = await reportCollection.findOne({ _id: new ObjectId(reportId) });
  if (!report) throw 'Error: Report not found';
  const deleteInfo = await reportCollection.deleteOne({ _id: new ObjectId(reportId) });
  if (!deleteInfo.deletedCount) throw 'Error: Could not delete report';
  return { reportId, deleted: true };
};

//removes all reports for a given item
const removeReportsByItemId = async (item_id) => {
  item_id = checkId(item_id, 'item_id');
  const reportCollection = await reports();
  const deleteInfo = await reportCollection.deleteMany({
    item_id: new ObjectId(item_id)
  });
  return { item_id, deletedCount: deleteInfo.deletedCount };
};
const _stringifyIds = (report) => {
  report._id = report._id.toString();
  report.reporterId = report.reporterId.toString();
  report.item_id = report.item_id.toString();
  return report;
};

export {
  addReport,
  getReportById,
  getAllReports,
  getReportsByType,
  getReportsByItemId,
  removeReport,
  removeReportsByItemId
};
