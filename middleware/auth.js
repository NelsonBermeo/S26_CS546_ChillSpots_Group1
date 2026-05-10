export const middleware = {
    logger : (req, res, next) => {
        const currDate = new Date().toUTCString();
        const reqMethod = req.method;
        const reqPath = req.path;
        const isAuthenticated = Boolean(req.session.member);

        if (isAuthenticated) {
            const memberStatus = req.session.member.role;
            console.log(`[${currDate}]: ${reqMethod} ${reqPath} (Authenticated ${memberStatus.charAt(0).toUpperCase() + memberStatus.slice(1)})`);
        } else {
            console.log(`[${currDate}]: ${reqMethod} ${reqPath} (Non-Authenticated)`);
        }

        next();
    }, 
    getregister : (req, res, next) => {
        const isAuthenticated = Boolean(req.session.member);
        if (!isAuthenticated) {
            next();
            return;
        }
        const memberState = req.session.member.role;
        if (memberState === "admin") {
            res.redirect('/admin/dashboard');
            return;
        }
        if (memberState === "user") {
            res.redirect('/user/profile');
            return;
        }

        next();
    },
    getlogin : (req, res, next) => {
        const isAuthenticated = Boolean(req.session.member);
        if (!isAuthenticated) {
            next();
            return;
        }
        const memberState = req.session.member.role;
        if (memberState === "admin") {
            res.redirect('/admin/dashboard');
            return;
        }
        if (memberState === "user") {
            res.redirect('/user/profile');
            return;
        }

        next();
    },
    getuser : (req, res, next) => {
        const isAuthenticated = Boolean(req.session.member);
        if (!isAuthenticated) {
            res.redirect('/login');
            return;
        }
        next();
    },
    getadmin : (req, res, next) => {
        const isAuthenticated = Boolean(req.session.member);
        if (!isAuthenticated) {
            res.redirect('/login');
            return;
        }
        const memberState = req.session.member.role;

        if (memberState === "user") {
            res.status(403).redirect('/user');
            return;
        }
        next();
    }, 
    getsignout : (req, res, next) => {
        const isAuthenticated = Boolean(req.session.member);
        if (!isAuthenticated) {
            res.redirect('/login');
            return;
        }
        next(); 
    }
}