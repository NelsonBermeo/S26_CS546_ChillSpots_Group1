import adminRoutes from "./admin.js";
import authRoutes from "./auth.js"
import locationRoutes from "./locations.js";
import reviewRoutes from "./reviews.js";
import userRoutes from "./users.js"

const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/location', locationRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('/user', userRoutes);

    app.use((req, res) => {
        res.status(404).render("error", {
            title: "Error",
            error: "The page you are looking for cannot be found.",
            loggedIn: Boolean(req.session.member),
            isAdmin: (Boolean(req.session.member)) ? 
                req.session.member.role === 'admin' :
                undefined
        })
    })
}

export default constructorMethod;