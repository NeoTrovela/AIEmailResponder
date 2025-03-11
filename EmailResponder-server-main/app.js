// app.js: 
// express server for ai email responder

const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const OpenAI = require("openai");

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// setup MySQL connection
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,        
  user: process.env.DATABASE_USER,        
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE_NAME,     
  port: process.env.DATABASE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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
