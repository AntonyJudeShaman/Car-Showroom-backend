const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
app.use(passport.initialize());

module.exports = app;
