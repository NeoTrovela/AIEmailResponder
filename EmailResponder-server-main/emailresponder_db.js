//
// emailresponder_db.js
//
// Exports 
// emailresponder_db: connection object to our MySQL database in AWS RDS
//

const mysql = require('mysql');
const fs = require('fs');
const ini = require('ini');

const config = require('./config.js');

const emailresponder_config = ini.parse(fs.readFileSync(config.emailresponder_config, 'utf-8'));
const endpoint = emailresponder_config.rds.endpoint;
const port_number = emailresponder_config.rds.port_number;
const user_name = emailresponder_config.rds.user_name;
const user_pwd = emailresponder_config.rds.user_pwd;
const db_name = emailresponder_config.rds.db_name;

//
// creates connection object, but doesn't open connnection:
//
let emailresponder_db = mysql.createConnection(
  {
    host: endpoint,
    port: port_number,
    user: user_name,
    password: user_pwd,
    database: db_name,
    multipleStatements: true  // allow multiple queries in one call
  }
);

module.exports = emailresponder_db;