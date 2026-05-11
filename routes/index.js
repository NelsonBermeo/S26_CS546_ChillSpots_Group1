import adminRoutes from "./admin.js";
import authRoutes from "./auth.js"
import locationRoutes from "./locations.js";
import reviewRoutes from "./reviews.js";
import userRoutes from "./users.js"
import publicListsRoutes from "./publicLists.js";

const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/location', locationRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('/user', userRoutes);
    app.use('/publiclists', publicListsRoutes);

    app.use((req, res) => {
        res.status(404).render("error", {
            title: "Error",
            error: "The page you are looking for cannot be found."
        })
    })
}

export default constructorMethod;