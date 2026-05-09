export const middleware = {
    logger : (req, res, next) => {
        const currDate = new Date().toUTCString();
        const reqMethod = req.method;
        const reqPath = req.path;
        const isAuthenticated = Boolean(req.session.member);

        if (isAuthenticated) {
            const memberStatus = req.session.member.membershipLevel;
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
        const memberState = req.session.member.membershipLevel;
        if (memberState === "admin") {
            res.redirect('/manager');
            return;
        }
    }
}