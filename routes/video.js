const express = require('express');
const http = require('http');
const { Router } = require("express");
const router = Router();
const app = express();
const server = http.createServer(app);
// const socket = require('socket.io');
// const io = socket(server);
const io = require("socket.io")(server , {
    cors : {
        origin : "http://localhost:5000",
        methods : ["GET","POST"]
    }
})

////@ create connection
io.on("connection" , (socket)=>{
    socket.emit("me", socket.id);
    console.log("connection created");

    socket.on("disconnect" , ()=>{
        socket.broadcast.emit("callEnded");
    })

    socket.on("callUser", (data) =>{
        io.to(data.userToCall).emit("callUser",{signal : data.signalData , 
                                                from : data.from , 
                                                name : data.name})
    })
    socket.on("answerCall" , (data)=> io.to(data.to).emit("callAccepted"), data.signal);
})

module.exports = router;