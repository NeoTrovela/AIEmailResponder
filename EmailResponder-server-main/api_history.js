const emailresponder_db = require('./emailresponder_db');
const openai = require('./emailresponder_openai.js');
const { query_database } = require('./utility.js');

//
// GET history
//
exports.get_history = async (req, res) => {
    const { email, tone } = req.query;
    let query = 'SELECT * FROM responses WHERE tone = ?';
    const values = [];
    const conditions = [];
    
    /*if (email) {
        conditions.push(`email LIKE ?`);
        values.push(`%${email}%`);
    }
    if (tone) {
        conditions.push(`tone = ?`);
        values.push(tone);
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }*/ //do we need?
    query += ' ORDER BY created_at DESC';
    
    try {
        //const [rows] = await pool.execute(query, values);
        const [rows] = await query_database(emailresponder_db, query, values);
        console.log(rows);
        res.status(200).json({'history': rows});

    } catch (error) {
        console.log("**Error in /history:");
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
} // get