import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';

const app = express();

import configRoutes from "./routes/index.js";
import { middleware }  from "./middleware/auth.js";

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    name: 'ChillAuthState',
    secret: 'chill string duper secret!!!',
    resave: false,
    saveUninitialized: false
}))

app.use('/', middleware.logger);
app.use('/register', middleware.getregister);
app.use('/login', middleware.getlogin);
app.use('/user', middleware.getuser);
app.use('/admin', middleware.getadmin);
app.use('/signout', middleware.getsignout);

configRoutes(app);

app.listen(3000, () => {
    console.log("Server's up!");
    console.log("Your routes will be running on http://localhost:3000");
});