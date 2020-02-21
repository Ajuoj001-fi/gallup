const restify = require("restify");
const crypto = require("crypto");
const corsMiddleWare = require("restify-cors-middleware");

const cors = corsMiddleWare({
    "origins" : ["http://localhost:3000","*"],
    "allowHeaders" : ["Authorization"]
});

const server = restify.createServer({
    accept: ['application/json', 'text/html']
});

const gallups = require("./models/gallups");
const PORT = (process.env.PORT || 3000);
const salt = 'xaxf230x>x!_!';

server.pre(restify.pre.sanitizePath()); 
server.pre(cors.preflight);
server.use(restify.plugins.bodyParser());
server.use(cors.actual);

server.post("/answer", (req,res,next) => {

    getClientIp = () => {
        return (req.headers["X-Forwarded-For"] ||
                req.headers["x-forwarded-for"] ||
                '').split(',')[0] ||
               req.client.remoteAddress;
    };

    let newData = req.body;

    let clientIp = getClientIp();

    gallups.checkUnique(clientIp,newData.id,(callback) => {
        if(callback == ""){
            gallups.setAnswer(clientIp,newData.id,newData.answer,(err,callback) => {
                        if(err){
                            console.log(err);
                            res.send("ei");
                        } else {
                            res.send("ok");
                        }
            });
        } else {
            res.send("olet jo äänestänyt");
        }

    });
});

server.get("/", (req,res,next) => {

    let body = "<b>/gallup</b> will return JSON  <br> <b>/answer</b> will take .POST {'id' : INT, 'answer' : INT} <br> <b>/status</b> will return the voting situation {answer1: INT,answer2: INT,answer3: INT} <br><br> /allquestions and /allanswers";
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });
    res.write(body);
    res.end();    
});

server.get("/allquestions", (req,res,next) => {

    gallups.allQuestions((err,data) => {
        res.send(data);
    });
});

server.get("/allanswers", (req,res,next) => {

    gallups.allAnswers((err,data) => {
        res.send(data);
    });
});

server.get("/gallup", (req,res,next) => {
    gallups.getQuestion((err,data) => {
        if(!err){
            res.send(data);
        } else {
            res.send("error while searching");
        }
        
    });
});

server.get("/create", (req,res,next) => {
    gallups.create((err,data) => {
        res.send("ok");
    });
});

server.get("/status", (req,res,next) => {

    gallups.getStatus((err,data) => {
        if(!err){
            if(data == ""){
                let newData = [{
                    answer : '1',
                    total : '0'
                },{
                    answer : '2',
                    total : '0'
                },{
                    answer : '3',
                    total : '0'
                }];
                data = newData;

            } else{
                if(!data[0]){
                let newData = {
                    answer : '1',
                    total : '0'
                };
                data.push(newData);
            } else if(data[0].answer != '1') {
                let newData = {
                    answer : '1',
                    total : '0'
                };
                data.splice(0,0,newData);
            }
    
            if(!data[1]){
                let newData = {
                    answer : '2',
                    total : '0'
                };
                data.splice(1,0,newData);
            } else if(data[1].answer != '2') {
                let newData = {
                    answer : '2',
                    total : '0'
                };
                data.splice(1,0,newData);
            } 
            }


            res.send(data);   
        } else {
            res.send(err);   
        }
            
    });
});

server.post("/check", (req,res,next) => {
    let user = "";
    if(req.body.user ){
        user = req.body.user;
        let hash = crypto.createHash("SHA512").update(salt + user).digest("hex");

        res.send(hash);
    } else {
        res.status(500);
        res.send("empty post");
    }
});

server.post("/delete", (req,res,next) => {
    gallups.delete(req.body.id,req.body.user,req.body.code,salt, (err) => {
        if(err){
            res.send("ei");
        } else {
            res.send("ok");
        }
    });
});

server.post("/setnewactive", (req,res,next) => {
    gallups.deactive(req.body.user,req.body.code,salt, (err) => {
        if(err){
            res.send("aktiivisen poisto epäonnistui");
        } else{
            gallups.activate(req.body.id, (err) => {
                if(err){
                    res.send("aktivointi epäonnistui");
                } else{
                    res.send("ok");
                }
            });
        }
    });
});

server.post("/addnew", (req,res,next) => {

    if(req.body.active == '1' ){
        gallups.deactive(req.body.user,req.body.code,salt, (err) => {
            if(err){
                res.send("aktiivisen poisto epäonnistui");
            }
        });
    }
    
    gallups.addnew(req.body.user,req.body.code,salt,req.body.question,req.body.answer1,req.body.answer2,req.body.answer3,req.body.startDate,req.body.endDate,req.body.active, (err) => {
        if(err){
            res.send("ei lisätty");
        } else {
            res.send("lisättiin");
        }
    });
});

server.post("/login", (req,res,next) => {
    let user = "";
    let pass = "";
    
    if(req.body.user && req.body.pass){
        user = req.body.user;
        pass = crypto.createHash("SHA512").update(req.body.pass).digest("hex");

        let sqlpass;

        gallups.login(user,(err,data) => {
            console.log(data);
            if(data != ""){
                sqlpass = data[0].pass;

                if(sqlpass == pass){
                    let access = {
                        "code" : crypto.createHash("SHA512").update(salt + data[0].username).digest("hex")
                    }
                    res.send(access);
                } else {
                    res.status(500);
                    res.send("login error");
                } 
            } else {
                res.status(500);
                res.send("no data");
            }

        });
    } else {
        res.status(500);
        res.send("empty fields");
    }
});


server.listen(PORT, () =>{

    console.log(`Palvelin käynnistyi porttiin ${PORT}`);
});