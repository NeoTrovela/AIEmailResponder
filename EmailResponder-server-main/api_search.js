const emailresponder_db = require('./emailresponder_db');
const openai = require('./emailresponder_openai.js');
const { query_database } = require('./utility.js');

//
// GET search
//
exports.get_search = async (req, res) => {
    console.log("**Call to get /server/:userid/:tone...");
    try {
        let user_id = req.params.userid;
        let tone = req.params.tone;
        console.log(tone);

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
        let query = 'SELECT * FROM responses WHERE userid = ? AND tone = ? ORDER BY created_at DESC;';
    
        const rows = await query_database(emailresponder_db, query, [user_id, tone]);
        res.json({
            'reply': rows
        });

    } catch (error) {
        console.log("**Error in /search:");
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
} // get