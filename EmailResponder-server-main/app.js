// app.js: 
// express server for ai email responder

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


// setup MySQL connection
/*const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,        
  user: process.env.DATABASE_USER,        
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE_NAME,     
  port: process.env.DATABASE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
app.put('/user', add_user.put_user);

/*
// endpoint to generate a response and store it in MySQL RDS
app.post('/generate', async (req, res) => {
  const { email, tone } = req.body;
  if (!email || !tone) {
    return res.status(400).json({ error: 'Missing email or tone in request body.' });
  }
  
  try {
    // call OpenAI API to generate a reply
    const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You're an AI email assistant. Respond to this email in a ${tone} tone.` },
          { role: "user", content: email }
        ],
    });
    const responseText = aiResponse.data.choices[0].message.content;
    
    // insert the email and its generated response into the MySQL database
    const insertQuery = 'INSERT INTO responses (email, tone, response, created_at) VALUES (?, ?, ?, NOW())';
    await pool.execute(insertQuery, [email, tone, responseText]);
    
    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Error in /generate:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// endpoint to retrieve response history with optional filtering
app.get('/history', async (req, res) => {
  const { email, tone } = req.query;
  let query = 'SELECT * FROM responses';
  const values = [];
  const conditions = [];
  
  if (email) {
    conditions.push(`email LIKE ?`);
    values.push(`%${email}%`);
  }
  if (tone) {
    conditions.push(`tone = ?`);
    values.push(tone);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';
  
  try {
    const [rows] = await pool.execute(query, values);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error in /history:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
*/