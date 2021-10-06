"use strict";

const express = require("express");
const server = express();
const ws = require("ws");
const fs = require('fs');

const dotenv = require("dotenv").config();

let DEBUG;
if (!process.env.PORT_HTTP) { // if this is false, there's no .env
    console.log("\nNo .env file was found.");
    DEBUG = true;
} else {
    console.log("\nFound .env file.");
    DEBUG = process.env.DEBUG === true;
}

let https, http, wss;
const PORT_HTTP = process.env.PORT_HTTP || 8080;
const PORT_HTTPS = process.env.PORT_HTTPS || 443;
const PORT_WS = process.env.PORT_WS || 8090; // not used unless you want a second ws port

if (!DEBUG) {
    http = require("http");

    http.createServer(function(req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(PORT_HTTP);

    let options = {
        key: fs.readFileSync(process.env.KEY_PATH),
        cert: fs.readFileSync(process.env.CERT_PATH)
    };

    https = require("https").createServer(options, server);

    wss = new ws.Server({ server: https });

    https.listen(PORT_HTTPS, function() {
        console.log("\nNode.js listening on https port " + PORT_HTTPS);
    });
} else {
    http = require("http").Server(server);
    
    wss = new ws.Server({ server: http });

    http.listen(PORT_HTTP, function() {
        console.log("\nNode.js listening on http port " + PORT_HTTP);
    });
}

server.use(express.static("public")); 

server.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 

const strokeLifetime = 10000;

class Frame {
    constructor() {
        this.strokes = [];
    }
}

class Layer {
    constructor() {
        this.frames = [];
    }

    getFrame(index) {
        if (!this.frames[index]) {
            //console.log("Client asked for frame " + index +", but it's missing.");
            for (let i=0; i<index+1; i++) {
                if (!this.frames[i]) {
                    let frame = new Frame();
                    this.frames.push(frame); 
                    //console.log("* Created frame " + i + ".");
                }
            }
        }
        //console.log("Retrieving frame " + index + " of " + this.frames.length + ".");
        return this.frames[index];
    }

    addStroke(data) {
        try {
            let index = data["index"];
            if (!isNaN(index)) {
                this.getFrame(index); 

                this.frames[index].strokes.push(data); 
                console.log("<<< Received a stroke with color (" + data["color"] + ") and " + data["points"].length + " points.");
            }
        } catch (e) {
            console.log("Error adding stroke" + e.data);
        }
    }
}

let layer = new Layer();

setInterval(function() {
    /*
    let time = new Date().getTime();

    for (let i=0; i<layer.frames.length; i++) {
        for (let j=0; j<layer.frames[i].strokes.length; j++) {
            if (time > layer.frames[i].strokes[j]["timestamp"] + strokeLifetime) {
                layer.frames[i].strokes.splice(j, 1);
                console.log("X Removing frame " + i + ", stroke " + j + ".");
            }
        }
    }
    */
    for (let i=0; i<layer.frames.length; i++) {
        layer.frames[i].strokes.shift();
        console.log("X Removing oldest stroke from frame " + i + ".");
    }
}, strokeLifetime);

// ~ ~ ~ ~

let lastIndex = 0;  // for ws

wss.on("connection", function(socket) {
    console.log("A user connected.");
    //~
    socket.on("disconnect", function(event) {
        console.log("A user disconnected.");
    });
    //~
    socket.on("clientStrokeToServer", function(data) { 
        //console.log(data);
        try { // json coming from Unity needs to be parsed...
            let newData = JSON.parse(data);
            layer.addStroke(newData);
        } catch (e) { // ...but json coming from JS client does not need to be
            layer.addStroke(data);
        }
    });
    //~
    socket.on("clientRequestFrame", function(data) {
        //console.log(data["num"]);
        let index = data["num"];
        if (index != NaN) {
            lastIndex = index; // for ws
            let frame = layer.getFrame(index);
            if (frame && frame.strokes.length > 0) {
                io.emit("newFrameFromServer", frame.strokes);
                console.log("> > > Sending a new frame " + frame.strokes[0]["index"] + " with " + frame.strokes.length + " strokes.");
            }
        }
    });
});
