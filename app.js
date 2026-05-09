import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';

const app = express();
import configRoutes from "./routes/index.js";
import { middleware } from "./middleware.js";

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.user(session({
    name: 'ChillAuthState',
    resave: false,
    saveUninitialized: false
}))

configRoutes(app);

app.listen(3000, () => {
    console.log("Server's up!");
    Console.log("Your routes will be running on https://localhost:3000")
});