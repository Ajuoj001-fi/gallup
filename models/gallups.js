mysql = require("mysql");

const connection = mysql.createConnection({
    host     : "miettii.net",
    user     : "miettiin_vieras",
    password : ",Nh^D{9LEUO6",
    database : "miettiin_juoja"
});

connection.connect((err) => {
if(!err) {
console.log("Connection ready");    
} else {
throw `Cannot connect to database: ${err}`;    
}
});


module.exports = {

    "create" : (callback) => {
        let sql = `CREATE TABLE users (
            id int(11) NOT NULL AUTO_INCREMENT,
            username varchar(50) NOT NULL,
            pass varchar(200) NOT NULL,
            user_level int(11) NOT NULL DEFAULT '0',
            PRIMARY KEY (id)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
          
          CREATE TABLE gallups (
            gallup_id int(11) NOT NULL AUTO_INCREMENT,
            active tinyint NOT NULL DEFAULT 0,
            start_date varchar(50) NOT NULL,
            end_date varchar(200) NOT NULL,
            question varchar(200) NOT NULL,
            answer1 varchar(200) NOT NULL,
            answer2 varchar(200) NOT NULL,
            answer3 varchar(200),
            PRIMARY KEY (gallup_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
          
          CREATE TABLE answers (
            answer_id int(11) NOT NULL AUTO_INCREMENT,
            user_key varchar(50) NOT NULL,
            question_id int(11) NOT NULL REFERENCES gallups(gallup_id),
            answer tinyint NOT NULL,
            PRIMARY KEY (answer_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
          
          INSERT INTO gallups (start_date, end_date, question, answer1, answer2,answer3)
          VALUES ('01-02-2020','02-02-2020','Kuljetko polkupyörällä?','Kyllä','En',NULL);
          
          INSERT INTO gallups (start_date, end_date, question, answer1, answer2,answer3)
          VALUES ('01-02-2020','02-02-2020','Kuka voitta Euroviisus 2020?','Suomi','Ruotsi','Joku muu...');
          
          INSERT INTO answers (user_key, question_id, answer) 
          VALUES('aaaaaaaa', 1, 1);
          INSERT INTO answers (user_key, question_id, answer) 
          VALUES('bbbbbbbb', 1, 1);
          INSERT INTO answers (user_key, question_id, answer) 
          VALUES('cccccccc', 1, 2);

          INSERT INTO answers (user_key, question_id, answer) 
          VALUES('dddddddd', 2, 3);
          INSERT INTO answers (user_key, question_id, answer) 
          VALUES('eeeeeeee', 2, 3);
          INSERT INTO answers (user_key, question_id, answer) 
          VALUES('ffffffff', 2, 2);
          
          INSERT INTO users(username,pass,user_level)
          VALUES('admin','adcabd9eb2d9bac4ce934aad144334a36458a072841cbbcfbbcc03f48d5414f3de919ca899a90e93ae110fa5b993026b6aa135c16378079bf9c424984d617795',1);
          
          INSERT INTO users(username,pass,user_level) 
          VALUES('testi','ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff',0);`;
        connection.query(sql, (err, data) => {
                                                callback(err, data);
                                            });
    },

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