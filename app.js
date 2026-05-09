import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';

const app = express();
import configRoutes from "./routes/index.js";
import { middleware } from "./middleware.js";