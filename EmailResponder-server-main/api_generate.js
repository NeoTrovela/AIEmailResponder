const emailresponder_db = require('./emailresponder_db');
const openai = require('./emailresponder_openai.js');
const { query_database } = require('./utility.js');

//
// POST generation
//
exports.post_generation = async (req, res) => {
    console.log("**Call to get /generate...");

    const { content, tone } = req.body;
    //console.log(req.body);
    //console.log(content);
    //console.log(tone);
    if (!content || !tone) {
        return res.status(400).json({ error: 'Missing email or tone in request body.' });
    }

    try {
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
        const insertQuery = 'INSERT INTO responses (email, tone, response, created_at) VALUES (?, ?, ?, NOW())';
        //await pool.execute(insertQuery, [email, tone, responseText]);
        let insert_promise = await query_database(emailresponder_db, insertQuery, [content, tone, responseText]);
        
        res.status(200).json({'reply': responseText});

    } catch (error) {
        console.log("**Error in /generate:");
        console.log(error.message);
        res.status(500).json({error: 'Internal server error.'});
    }
} // post