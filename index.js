const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./models/users');

// const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const bodyParser = require('body-parser')

app.use(cors());
// app.use(router);
app.use(bodyParser.json())


//////////////////////////////////////////////////////////////////////////////////////////
mongoose.set('useFindAndModify', false);
const mongoUri = "mongodb+srv://shahiba:Edaf6B8Qw3CcAQzh@cluster0.ff0ug.mongodb.net/<dbname>?retryWrites=true&w=majority"
mongoose.connect(mongoUri,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex: true,
    useFindAndModify: false
})
mongoose.connection.on("connected",()=>{
    console.log("connected to mongo yeahhh")
})
mongoose.connection.on("error",(err)=>{ 
    console.log("error",err)
})





io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) 
    return (
        callback(error)
    )

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message, media:false });

    callback();
  });

  socket.on('sendPhoto', (photo, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('media', { user: user.name, text: photo, media:true });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started at Port.`));