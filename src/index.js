const path = require("path");
const express = require("express");
const http = require("http")
const socketio = require("socket.io");
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

//#region web socket
/**
 * default method and event provided by web socket to create connection.
 */
io.on("connection", socket => {
    console.log("New websocket connection");

    
    socket.on("join", ({ username, room }, callback)=>{
        const {error, user} = addUser({ id:socket.id, username, room });
        // console.log(error);
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message", generateMessage("admin", "Welcome!"));
        socket.broadcast.to(user.room).emit("message", generateMessage("admin", `${user.username} has joined!`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    //gets the message value from clint side JS
    socket.on("sendMsg", (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        //To check for any abusive words
        if(filter.isProfane(message)){
            return callback("Profanity not allowed!");
        }
        io.to(user.room).emit("message", generateMessage(user.username, message));
        callback('message delivered!');
    })

    //Broadcasts the message whenever a new user joins or makes a new connection
    // socket.broadcast.emit("brd", "A new user has joined!");

    //disconnect is an event provided by web socket
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit("message", generateMessage("admin", `${user.username} has left!`))
        }
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    });

    socket.on("sendLocation", (location, callback) => {
        const user = getUser(socket.id);
        const currentLocation = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, currentLocation));
        callback();
    });

})
//#endregion

const port = process.env.PORT||3000;

app.use(express.json());
const publicDirectoryPath = path.join(__dirname,"../public");
app.use(express.static(publicDirectoryPath));

server.listen(port, ()=>{
    console.log("app running on port : "+port);
})