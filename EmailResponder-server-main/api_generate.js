const emailresponder_db = require('./emailresponder_db');
const openai = require('./emailresponder_openai.js');
const { query_database } = require('./utility.js');

//
// POST generation
//
exports.post_generation = async (req, res) => {
    console.log("**Call to get /generate/:userid...");
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
                "reply": "No such user...",
                "responseid": -1
            });
        }

        const { content, tone } = req.body;
        //console.log(req.body);
        //console.log(content);
        //console.log(tone);
        if (!content || !tone) {
            return res.status(400).json({ error: 'Missing email or tone in request body.' });
        }
    
        // call OpenAI API to generate a reply
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {role: "system", content: `You're an AI email assistant. Respond to this email in a ${tone} tone.`},
              {role: "user", content: content}
            ],
        });
        //console.log(aiResponse.choices[0]);
        const responseText = aiResponse.choices[0].message.content;
        //console.log(responseText);
        
        // insert the email and its generated response into the MySQL database
        const insertQuery = 'INSERT INTO responses (email, tone, response, created_at, userid) VALUES (?, ?, ?, NOW(), ?)';
        //await pool.execute(insertQuery, [email, tone, responseText]);
        let insert_promise = await query_database(emailresponder_db, insertQuery, [content, tone, responseText, user_id]);
        
        if (insert_promise.affectedRows === 1) {
            res.json({
                "reply": responseText,
                "responseid": insert_promise.insertId
            });
        }
        else{
            res.status(500).json({
                "reply": "insert database failed",
                "responseid": -1
            });
        }

    } catch (error) {
        console.log("**Error in /generate:");
        console.log(error.message);
        res.status(500).json({error: 'Internal server error.'});
    }
} // post