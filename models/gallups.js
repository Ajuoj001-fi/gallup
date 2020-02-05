mysql = require("mysql");
//mysql://b79a663c3fae1b:14dc545c@eu-cdbr-west-02.cleardb.net/heroku_4f5a858fa0ca67d?reconnect=true
//

const connection = mysql.createConnection({
    host     : "eu-cdbr-west-02.cleardb.net",
    user     : "b79a663c3fae1b",
    password : "14dc545c",
    database : "heroku_4f5a858fa0ca67d"
});

connection.connect((err) => {
if(!err) {
console.log("Connection ready");    
} else {
throw `Cannot connect to database: ${err}`;    
}
});


module.exports = {

    "getQuestion" : (callback) => {
        let sql = `SELECT * FROM gallups WHERE active = 1`;
        connection.query(sql, (err, data) => {
                                                callback(err, data);
                                            });
    },

    "getStatus" : (callback) => {
        let findActive = `SELECT gallup_id AS id FROM gallups WHERE active = 1`;
        let sql = `SELECT answer, COUNT(*) as total FROM answers WHERE question_id = ? GROUP BY answer`;
        connection.query(findActive, (err, gallups) => {
            connection.query(sql,[gallups[0].id], (err, data) => {
                                                    callback(err, data);
                                                });
        });
       
    },

   "checkUnique" : (ip,id,callback) =>{
        let sql = `SELECT * FROM answers WHERE user_key = ? AND question_id = ?`;
        connection.query(sql,[ip,id],(err,data)=> {
            callback(data)
        });
   },

    "setAnswer" : (key,id,answer,callback) => {
        let sql = `INSERT INTO answers (user_key, question_id, answer) VALUES(?,?,?)`;
        connection.query(sql,[key,id,answer],(err)=> {
                                                        callback(err);
                                                    });
    },
};