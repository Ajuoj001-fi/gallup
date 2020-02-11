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

            gallups.setAnswer(clientIp,newData.id,newData.answer,(err,callback) => { //vaihda newData.key -> clientIp / newData.key
                        if(err){
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
        res.send(data);
    });
});

server.get("/create", (req,res,next) => {
    gallups.create((err,data) => {
        res.send("ok");
    });
});

server.get("/status", (req,res,next) => {

    gallups.getStatus((err,data) => {
        res.send(data);
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
                        "code" : crypto.createHash("SHA512").update(salt + data[0].username).digest("hex"),
                        "code2" : crypto.createHash("SHA512").update(salt + pass).digest("hex")
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