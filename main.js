const restify = require("restify");
const crypto = require("crypto");
const server = restify.createServer({
    accept: ['application/json', 'text/html']
});

const gallups = require("./models/gallups");
const portti = process.env.PORT || 3000;

server.pre(restify.pre.sanitizePath()); 
server.use(restify.plugins.bodyParser());

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
                res.send("tähän vois ottaa callbakkinä tiedot nykyisestä tilanteesta");
            });
        } else {
            res.send("olet jo äänestänyt");
        }

    });   
});

server.get("/", (req,res,next) => {

    let body = "<b>/gallup</b> will return JSON  <br> <b>/answer</b> will take .POST {'question_id' : INT, 'answer' : STRING} <br> <b>/status</b> will return the voting situation {answer1: INT,answer2: INT,answer3: INT}";
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });
    res.write(body);
    res.end();    
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

server.listen(portti, () =>{

    console.log(`Palvelin käynnistyi porttiin ${portti}`);
});