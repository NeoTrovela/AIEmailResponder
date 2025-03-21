const emailresponder_db = require('./emailresponder_db');
const openai = require('./emailresponder_openai.js');
const { query_database } = require('./utility.js');

//
// GET history
//
exports.get_history = async (req, res) => {
    console.log("**Call to get /history/:userid...");
    try {
        let user_id = req.params.userid;

        let sql = `
            SELECT * FROM users WHERE userid = ?;
            `;

        let sql_promise = query_database(emailresponder_db, sql, [user_id]);
        let sql_result = await Promise.all([sql_promise]);

        //console.log(sql_result);

        if(sql_result[0].length === 0){ // invalid user id
            return res.status(400).json({
                'reply': "No such user...",
            });
        }

        //const { email, tone } = req.query;
        let query = 'SELECT * FROM responses WHERE userid = ? ORDER BY created_at DESC;';
    //const values = [];
    //const conditions = [];
    
    /*if (email) {
        conditions.push(`email LIKE ?`);
        values.push(`%${email}%`);
    }*/
    /*if (tone) {
        conditions.push(`tone = ?`);
        values.push(tone);
    }*/
    /*if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }*/ //do we need?
    //query += ' ORDER BY created_at DESC';
    
        //const [rows] = await pool.execute(query, values);
        const rows = await query_database(emailresponder_db, query, [user_id]);
        console.log(rows);
        //let history = rows[0];
        //console.log(history);
        res.json({
            'reply': rows
        });

    } catch (error) {
        console.log("**Error in /history:");
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
} // get