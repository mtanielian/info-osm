// Requires - Constants
require('./config/constants');
const express = require('express');
const rOSM = require('./routes/osm');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const numeral = require('numeral');
const json = require('hbs-json');
const Handlebars = require('hbs');

// Init Express
const app = express();

// Set Engine
app.set('view engine', 'hbs');


app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(morgan("common"));


Handlebars.registerHelper('json', json);

Handlebars.registerHelper('formatN', function(n, decimals) {
  return decimals 
    ? numeral(n).format('0,0.00') 
    : numeral(n).format('0,0')
  ;
});

// limiter per request from ip
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50, 
  message:
    "Too many accounts created from this IP, please try again after an hour"
});


// Set Routes and Limiter per request
app.use('/', limiter, rOSM);

const server = app.listen(config.host.port, config.host.ip, () => {
    console.log("run server");
});


