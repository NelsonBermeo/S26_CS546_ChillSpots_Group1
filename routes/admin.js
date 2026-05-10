import { Router } from 'express';
import xss from 'xss';
import { validate, checkId } from '../validation.js';
import * as reports from '../data/reports.js'
import * as comments from '../data/comments.js'
import * as reviews from '../data/reviews.js'
import * as locations from '../data/locations.js'
import { getUserById } from '../data/users.js';

const router = Router();

/**
 * Ask about what an admin should be and how we're handling adding administrative users.
 * 2 different methods:
 * 1. Admins have the same pages and views as a normal viewer but each page grants them extra features.
 *  - Such as the ability to see posts removed for being reported too often and deal with these posts as they
 *    see fit.
 * 2. Admins get their own dashboard page where they can see all reports for any purpose. Filter / sort 
 *    by certain features of a report like date of report.
 * 
 * Technically both can exist, and imo is preferred. (Ask Patrick Hill.)
 * 
 */

router
    .route('/dashboard')
    .get(async (req, res) => {
        if (!req.session.member) {
            res.redirect('/');
            return;
        }
        if (req.session.member.role === "member") {
            res.redirect('/user/profile');
            return;
        } else if (req.session.member.role === "admin") {
            try {
                const reportData = await reports.getAllReports();
                const reportList = await Promise.all(
                    reportData.map(async e => ({
                        reporter: await ( async () => {
                            try {
                                const user = await getUserById(e.reporterId);
                                return "" + user.email;
                            } catch (e) { return "Unknown User, email could not be provided." }})(),
                        id: e._id,
                        type: e.type, 
                        content: e.content
                    })
                ));

                res.render('admindashboard', {
                    title: "Admin Dashboard",
                    reports: reportList
                })
            } catch (e) {
                res.status(500).render('error', {title: "Error", error: "Internal Server Error"})
            }
        } else { res.redirect('/'); return; }
    });

router
    .route('/dashboard/:reportId')
    .delete(async (req, res) => {
        // This might need clientside js to directly inject the result into the delete method
        req.params.reportId = checkId(req.params.reportId, "Report ID");
        const report = await reports.getReportById(req.params.reportId);

        switch (report.type) {
        case "location":
            try{
                const location = await locations.getLocationById(report.item_id);
                // What does it even mean to remove a location???
                // Do we also delete any reviews with comments left at that location?
                // Same question for reviews.
                await locations.removeLocation(report.item_id);
            } catch (e) {
                res.status(404).render('error', {title: "Error", error: e})
            }
            break;
        case "comment":
            try {
                const comment = await comments.getCommentById(report.item_id);
                await comments.removeComment(report.item_id);
            } catch (e) {
                res.status(404).render('error', {title: "Error", error: e})
            }
            break;
        case "review":
            try {
                const review = await reviews.getReviewById(report.item_id);
                await reviews.removeReview(report.item_id);
            } catch (e) {
                res.status(404).render('error', {title: "Error", error: e})
            }
            break;
        default:
            res.status(500).render('error', {title: "Error", error: `report type not found for: ${report.type}`})
        }
    })

export default router;