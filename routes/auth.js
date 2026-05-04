import { Router } from 'express';
import xss from 'xss';
import { validate } from '../validation.js';
import { addUser } from '../data/users.js';
const router = Router();

router.route('/').get(async (req, res) => {
    try {
        if (!req.sesson.member) {
            res.render('home', {});
        }
    } catch (e) {
        return res.status(500).json({error : e});
    }
});

router
    .route('/register')
    .get(async (req, res) => {
        try {
           res.render('register');
        } catch (e) {
            return res.status(500).json({error : e});
        }
    })
    .post(async (req, res) => {
        for (let key in req.body) {
            req.body[key] = xss(req.body[key]);
        }
        let fieldsToNotPresent = {
            firstName:      !req.body.firstName,
            lastName:       !req.body.lastName,
            username:       !req.body.username,
            email:          !req.body.email,
            password:       !req.body.password,
            confirmPass:    !req.body.confirmPass
        }
        let fieldsNotPresent = Object.entries(fieldsToNotPresent).filter(([key, value]) => value).map(e => e[0]);
        if (fieldsNotPresent.length > 0) {
            let err_str = "";
            for (let field of fieldsNotPresent) {
                err_str += ` ${field},`;
            }
            res.status(400).render('register', {
                title: "ChillSpots - Register Now", 
                currForm: req.body,
                errors: [`The following fields were missing: ${err_str.slice(0, -1)}`]
            });
            return;
        }
        let errors = [];
        try {
            validate.name(req.body.firstName, "First Name");
        } catch (e) {
            req.body.firstName = null;
            errors.push(e);
        }
        try {
            validate.name(req.body.lastName, "Last Name");
        } catch (e) {
            req.body.lastName = null;
            errors.push(e);
        }
        try {
            validate.username(req.body.username, "Username");
        } catch (e) {
            req.body.username = null;
            errors.push(e);
        }
        try {
            validate.email(req.body.email, "Email");
        } catch (e) {
            req.body.email = null;
            errors.push(e);
        }
        try {
            validate.password(req.body.password, "Password");
        } catch (e) {
            req.body.password = null;
            errors.push(e);
        }
        try {
            validate.password(req.body.confirmPass, "Confirmed Password");
        } catch (e) {
            req.body.confirmPass = null;
            errors.push(e);
        }
        if (req.body.password !== req.body.confirmPass) {
            errors.push("Confirmed password does not match password.");
            req.body.password = null;
            req.body.confirmPass = null;
        }
        try {
            validate.age(req.body.age, "Age");
        } catch (e) {
            req.body.age = null;
            errors.push(e);
        }
        if (errors.length > 0) {
            res.status(400).render('register', {
                title: "ChillSpots - Register Now", 
                currForm: req.body,
                errors: errors
            });
            return;
        }
        try {
            let success = await addUser(
                req.body.firstName,
                req.body.lastName,
                req.body.username,
                req.body.email,
                req.body.password,
                null,
                req.body.age
            )
            if (!success) {
                res.status(500).render('error', {title: "Error", error: "Internal Server Error"})
                return;
            }
            res.redirect('/login');
            return;
        } catch (e) {
            res.status(400).render('register', {
                title: "ChillSpots - Register Now", 
                currForm: req.body,
                errors: [e]
            })
        }
    });

router
    .route('/login')
    .get(async (req, res) => {
        try {
            res.render('login', {title: "ChillSpots - Login"});
        } catch (e) {
            res.status(404).render('error', {title: "Error", error: e})
        }
    })
    .post(async (req, res) => {
        for (let key in req.body) {
            req.body[key] = xss(req.body[key]);
        }
        let fieldsToNotPresent = {
            username:       !req.body.username,
            password:       !req.body.password,
        }
        let fieldsNotPresent = Object.entries(fieldsToNotPresent).filter(([key, value]) => value).map(e => e[0]);
        if (fieldsNotPresent.length > 0) {
            let err_str = "";
            for (let field of fieldsNotPresent) {
                err_str += ` ${field},`;
            }
            res.status(400).render('register', {
                title: "ChillSpots - Login", 
                currForm: req.body,
                errors: [`The following fields were missing: ${err_str.slice(0, -1)}`]
            });
            return;
        }
        let errors = [];
        try {
            validate.username(req.body.username, "Username");
        } catch (e) {
            req.body.username = null;
            errors.push(e);
        } try {
            validate.password(req.body.password, "Password");
        } catch (e) {
            req.body.password = null;
            errors.push(e);
        }
        if (errors.length > 0) {
            res.status(400).render('login', {
                title: "ChillSpots - Login",
                currForm: req.body,
                errors: errors
            })
        }
        try {
            const userData = await authenticateMember(req.body.username, req.body.password);
            req.session.member = userData;

            if (userData.membershipLevel === "admin") {

            } else if (userData.membershipLevel === "member") {
                
            }
        } catch (e) {

        }
    })

export default router;