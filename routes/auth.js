import { Router } from 'express';
import xss from 'xss';
import { validate } from '../validation.js';
import { addUser, checkUser } from '../data/users.js';
import { checkRegisterAchievements } from '../data/achievements.js';
const router = Router();
import {upload} from "../middleware/upload.js"
import {uploadImage} from "../utils/imageUpload.js"

router.route('/').get(async (req, res) => {
    try {
        if (req.session.member) res.render('home', {
            title: "ChillSpots - Home",
            loggedIn: true,
            isAdmin: req.session.member.role === 'admin'
        });
        else res.render('home', {
            title: "ChillSpots - Home"
        });
    } catch (e) {
        return res.status(500).render('error', {
            title: "Error", 
            error : e,
            loggedIn: Boolean(req.session.member),
            isAdmin: (Boolean(req.session.member)) ? 
                req.session.member.role === 'admin' :
                undefined
        });
    }
});

router.route('/home').get(async (req, res) => { res.status(404).redirect('/'); })

router
    .route('/register')
    .get(async (req, res) => {
        try {
            res.render('register');
        } catch (e) {
            return res.status(500).render('error', {
            title: "Error", 
            error : e,
            loggedIn: Boolean(req.session.member),
            isAdmin: (Boolean(req.session.member)) ? 
                req.session.member.role === 'admin' :
                undefined
        });
        }
    })
    .post(upload.single('profilePic'), async (req, res) => {
        for (let key in req.body) {
            req.body[key] = xss(req.body[key]);
        }
        let fieldsToNotPresent = {
            firstName:      !req.body.firstName,
            lastName:       !req.body.lastName,
            username:       !req.body.username,
            email:          !req.body.email,
            password:       !req.body.password,
            confirmPass:    !req.body.confirmPass,
            adminSecret:    false
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
            var pass_failed = true;
            errors.push(e);
        }
        try {
            validate.password(req.body.confirmPass, "Confirmed Password");
        } catch (e) {
            req.body.confirmPass = null;
            if (!pass_failed) errors.push(e);
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
        try {
            validate.admin_key(req.body.adminSecret);
        } catch (e) {
            req.body.adminSecret = null;
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
            let profilePicUrl = "/public/images/default-profile.jpg";
            if(req.file){
                profilePicUrl = await uploadImage(req.file, "users")
            }
            let success = await addUser(
                req.body.firstName,
                req.body.lastName,
                req.body.username,
                req.body.email,
                req.body.password,
                profilePicUrl,
                req.body.age,
                req.body.adminSecret
            )
            if (!success) {
                res.status(500).render('error', {title: "Error", error: "Internal Server Error"})
                return;
            }
            try {
                await checkRegisterAchievements(success);
            } catch (e) {
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
            email:    !req.body.email, 
            password: !req.body.password,
        }
        let fieldsNotPresent = Object.entries(fieldsToNotPresent).filter(([key, value]) => value).map(e => e[0]);
        if (fieldsNotPresent.length > 0) {
            let err_str = "";
            for (let field of fieldsNotPresent) {
                err_str += ` ${field},`;
            }
            res.status(400).render('login', {
                title: "ChillSpots - Login", 
                errors: [`The following fields were missing: ${err_str.slice(0, -1)}`]
            });
            return;
        }
        let errors = [];
        try {
            validate.email(req.body.email, "Email");
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
            const userData = await checkUser(req.body.email, req.body.password); 
            req.session.member = userData;

            if (userData.role === "admin") {
                res.redirect("/admin/dashboard");
            } else if (userData.role === "user") {
                res.redirect("/user/profile")
            }
        } catch (e) {
            res.status(500).render("error", {title: "Error", error: `Internal Server Error Occured: ${e}`})
        }
    })

router.route("/signout").get(async (req, res) => {
    req.session.destroy();
    res.redirect('..');
})

export default router;