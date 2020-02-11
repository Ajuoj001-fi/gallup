mysql = require("mysql");
crypto = require("crypto");

const connection = mysql.createConnection({
    host     : "eu-cdbr-west-02.cleardb.net",
    user     : "b79a663c3fae1b",
    password : "14dc545c",
    database : "heroku_4f5a858fa0ca67d"
});


handleDisconnect = () => {

    connection.on('error', (err) => {
        if (!err.fatal) {
          return;
        }
    
        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
          throw err;
        }
    
        console.log('Re-connecting lost connection: ' + err.stack);
    
        connection = mysql.createConnection(connection.config);
        handleDisconnect(connection);
        connection.connect();
    });
}

handleDisconnect(connection);

module.exports = {



    "getQuestion" : (callback) => {
        let sql = `SELECT * FROM gallups WHERE active = 1`;
        connection.query(sql, (err, data) => {
                                                callback(err, data);
                                            });
    },

    "allQuestions" : (callback) => {
        let sql = `SELECT * FROM gallups`;
        connection.query(sql, (err, data) => {
                                                callback(err, data);
                                            });
    },

    "allAnswers" : (callback) => {
        let sql = `SELECT answer, question_id FROM answers`;
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

    "login" : (user,callback) => {
        let sql = `SELECT * FROM users WHERE username = ?`;
        connection.query(sql,[user],(err,data)=> {
                                                        callback(err,data);
                                                    });
    },

    "delete" : (id,username,code,salt,callback) => {
        console.log("yritän");
        console.log(code);
        let sql = `SELECT * FROM users WHERE username = ?`;
        let sql2 = `DELETE FROM gallups WHERE gallup_id = ?`;
        connection.query(sql,[username],(err,data)=> {

            let check = crypto.createHash("SHA512").update(salt + data[0].username).digest("hex")
            console.log("yritän2");
            console.log(check);
            if(check == code){
                console.log("päästiin");
                connection.query(sql2,[id],() => {
                    callback();
                });
            }
        });
    }
};