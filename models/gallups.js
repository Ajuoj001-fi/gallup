mysql = require("mysql");
crypto = require("crypto");

const config ={
    host     : "eu-cdbr-west-02.cleardb.net",
    user     : "b79a663c3fae1b",
    password : "14dc545c",
    database : "heroku_4f5a858fa0ca67d"
};


handleDisconnect = () => {
    connection = mysql.createConnection(config);

    connection.connect((err) => {
        if(err){
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', (err) => {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else{
          throw err;
        }        
    });
}

handleDisconnect();

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
            if(gallups != ""){
                connection.query(sql,[gallups[0].id], (err, data) => {
                                                        callback(err, data);
                                                    });
            } else{
                let err = "No gallups were found.";
                callback(err);
            }
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
        let sql = `SELECT * FROM users WHERE username = ?`;
        let sql2 = `DELETE FROM gallups WHERE gallup_id = ?`;
        connection.query(sql,[username],(err,data)=> {

            let check = crypto.createHash("SHA512").update(salt + data[0].username).digest("hex")
            if(check == code){
                connection.query(sql2,[id],(err) => {
                    callback(err);
                });
            }
        });
    },

    "addnew" : (username,code,salt,question,ans1,ans2,ans3,startDate,endDate,active,callback) => {
        let sql = `SELECT * FROM users WHERE username = ?`;
        let insert = `INSERT INTO gallups (active, start_date, end_date, question, answer1, answer2, answer3) VALUES(?,?,?,?,?,?,?)`;

        connection.query(sql,[username],(err,data)=> {
            let check = crypto.createHash("SHA512").update(salt + data[0].username).digest("hex")
            if(check == code){
                connection.query(insert,[active, startDate, endDate, question, ans1, ans2, ans3],(err) => {
                    console.log(err);
                    callback(err);
                });
            }
        });
    },

    "deactive" : (username,code,salt,callback) => {
        let deactive = `UPDATE gallups SET active = 0 WHERE active = 1`;

        connection.query(deactive,(err)=> {
            callback(err);
        });
    },

    "activate" : (id,callback) => {
        let activate = `UPDATE gallups SET active = 1 WHERE gallup_id = ?`;

        connection.query(activate,[id],(err)=> {
            callback(err);
        });
    },


};