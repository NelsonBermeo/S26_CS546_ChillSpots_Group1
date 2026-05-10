import { Router } from 'express';
import xss from 'xss';
import { validate } from '../validation.js';
import * as reports from '../data/reports.js'

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
            res.redirect('/user');
            return;
        } else if (req.session.member.role === "admin") {
            try {
                const reportData = await reports.getAllReports();
                const reportList = reportData.map(e => ({
                    type: e.type, 
                    content: e.content,
                    isLocation: (e.type === "location"),
                    isComment: (e.type === "comment"),
                    isReview: (e.type === "review"),
                }));

                res.render('admindashboard', {
                    title: "Admin Dashboard",
                    reports: reportList
                })
            } catch (e) {
                res.status(500).render('error', {title: "Error", error: "Internal Server Error"})
            }
        } else { res.redirect('/'); return; }
    })
    .post(async (req, res) => {

    })

export default router;