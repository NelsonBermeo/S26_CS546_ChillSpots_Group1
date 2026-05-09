import adminRoutes from "./admin.js";
import authRoutes from "./auth.js"
import homeRoutes from "./homepage.js"
import locationRoutes from "./locations.js";
import reviewRoutes from "./reviews.js";
import userRoutes from "./users.js"

const constructorMethod = (app) => {
    app.use('/', homeRoutes);
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/location', locationRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('/user', userRoutes);

    app.use((req, res) => {
        res.status(404).render("error", {error: "The page you are looking for cannot be found."})
    })
}

export default constructorMethod;