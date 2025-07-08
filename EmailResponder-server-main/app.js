// app.js: 
// express server for ai email responder
// run with `node app.js`

const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = require('./config.js');
const emailresponder_db = require('./emailresponder_db.js')

const app = express();
app.use(bodyParser.json());

var startTime; // time variable

const OpenAI = require("openai");

// Initialize OpenAI API client
/*const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});*/


//
// main():
//
app.listen(config.service_port, () => {
  startTime = Date.now();
  console.log('**Web service running, listening on port', config.service_port);
  //
  // Configure AWS to use our config file:
  //
  //process.env.AWS_SHARED_CREDENTIALS_FILE = config.photoapp_config;
});

//
// web service functions
//
let generate = require('./api_generate.js');
let history = require('./api_history.js');
let search = require('./api_search.js');
let add_user = require('./api_user.js');

//
// request for default page
//
app.get('/', (req, res) => {
  try {
    console.log("**Call to /...");
    
    let uptime = Math.round((Date.now() - startTime) / 1000);

    res.json({
      "status": "running",
      "uptime-in-secs": uptime,
      "dbConnection": emailresponder_db.state
    });
  }
  catch(err) {
    console.log("**Error in /");
    console.log(err.message);

    res.status(500).json(err.message);
  }
});

app.post('/generate/:userid', generate.post_generation);
app.get('/history/:userid', history.get_history);
app.get('/search/:userid/:tone', search.get_search);
app.put('/user', add_user.put_user);