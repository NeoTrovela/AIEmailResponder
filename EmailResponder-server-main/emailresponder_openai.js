const mysql = require('mysql');
const fs = require('fs');
const ini = require('ini');

const { Configuration, OpenAI } = require('openai');

const config = require('./config.js');

const emailresponder_config = ini.parse(fs.readFileSync(config.emailresponder_config, 'utf-8'));
//const api_key = emailresponder_config.openai.api_key;
// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: emailresponder_config.openai.api_key,
});

module.exports = openai;