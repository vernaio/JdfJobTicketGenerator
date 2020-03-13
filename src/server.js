const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bodyParserError = require('bodyparser-json-error');
const version = require('./version');
const jobTicketGenerator = require('./index');
const model = require('./model');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParserError.beautify({ status: 500, res: { msg: 'You sent a bad JSON !' } }));// Beautify body parser json syntax error

//GET the version
app.get('/version', (req, res) => {
    res.status(200).send(version.getVersion());
});

//POST a json
app.post('/json/:sheetid', (req, res) => {
    
    var sheetId = req.params.sheetid;
    var gangJobEvent = req.body["gangJobEvent-Root"];
    var outJDF; 
    //node.log("Received job " + sheetId);
    if (gangJobEvent.gangJob.workStyle==="SIMPLEX") {
        model.getApogeeSimplex()
        .then(jdf => {
            var lineArray = jdf.toString().split("\n");
            outJDF = jobTicketGenerator.writeApogeeJdf(
                sheetId,
                gangJobEvent,
                0,
                lineArray
            );
            res.set('Content-Type', 'text/plain');
            return res.status(200).send(outJDF);
        })
        .catch(error => {
            //node.log(error);
            node.error(error);
        })
    }

    else{
        model.getApogeeSimplex()
        .then(jdf => {
            var lineArray = jdf.toString().split("\n");
            outJDF = jobTicketGenerator.writeApogeeJdf(
                sheetId,
                gangJobEvent,
                0,
                lineArray
            );
            res.set('Content-Type', 'text/plain');
            return res.status(200).send(outJDF);
        })
        .catch(error => {
            console.log(error);
        })
    }
});

//GET UI
app.get('/*', (req, res) => {
    //res.sendFile(path.join(__dirname + '/html/index.html'));
    var root = './src/html/';
    var url = req.url;
    
    if(url.substr(url.length - 5).indexOf(".") === -1){
        url = path.join(url, "index.html");
    }
    
    // set asset path
    var assetPath = path.join(root, url);

    // define content type
    var contentType = "application/octet-stream"
    
    if(path.extname(assetPath) === ".html" || path.extname(assetPath) === ".htm") {
        contentType = 'text/html';
    } else if (path.extname(assetPath) === ".js") {
        contentType = 'text/javascript';
    } else if (path.extname(assetPath) === ".css") {
        contentType = 'text/css';
    } else if (path.extname(assetPath) === ".ico") {
        contentType = 'image/x-icon';
    } else if (path.extname(assetPath) === ".svg") {
        contentType = 'image/svg+xml';
    }
    
    // try to deliver asset
    if(fs.existsSync(assetPath)) {
        fs.readFile(assetPath, (err, data) => {
            if (err) throw err;
            res.set('Content-Type', contentType)
            res.status(200).send(data);
        });
        
    } 
    
    //asset not found: 404
    else {
        assetPath = path.join(root, "404.html");
        fs.readFile(assetPath, (err, data) => {
            if (err) throw err;
            res.set('Content-Type', contentType)
            res.status(404).send(data);

        });
    }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 4202;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});