const express=require('express');
const app=express();
const http=require('http')
const httpServer=http.createServer(app);

const {Server}=require('socket.io')

const io=new Server(httpServer) // websocket attached to the httpServer

app.set('views','./views');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

const rooms={};

app.get('/',(req,res)=>{
    res.render('index',{rooms:rooms});
})

app.post('/room',(req,res)=>{
    if(rooms[req.body.room])return res.redirect('/');
    
    rooms[req.body.room]={users:{}};
    res.redirect(`/${req.body.room}`);

    //send message that a new room was created
    io.emit('room-created',req.body.room)
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomName:req.params.room});
})


const getUserRooms=(socket)=>{
    return Object.entries(rooms).reduce((names,[username,room])=>{
        if(room.users[socket.id])names.push(username);
        return names;
    },[])
}


io.on('connection',socket=>{
    //console.log("new user");
    //socket.emit('chat-message-to-console','Hello this is pranetha');
    socket.on('new-user',(room,username)=>{
        socket.join(room);
        rooms[room].users[socket.id]=username; // socket.id is a unique identiifier for each client connected to the socket
        socket.to(room).emit('user-connected',username);
        //console.log(users);
    })

    socket.on('send-chat-message',(room,message)=>{
        // send it to everyone on that server , except the person who sent it
        socket.to(room).emit('chat-message',{username:rooms[room].users[socket.id],message:message});
    })

    //when user disconnects
    socket.on('disconnect',()=>{
        getUserRooms(socket).forEach(room=>{
            socket.to(room).emit('user-disconnected',rooms[room].users[socket.id]);
            delete rooms[room].users[socket.id];
        }) 
    })
})


// websocket server ....which here is basically an upgraded version of HTTP(HTTP upgrade through a "handshake")
httpServer.listen(3000,()=>{ // for normal(express) requests
  console.log('Server is running on port 3000');
});
// httpservers can handle both kind of requests.....
// normal requests (get and post) are handled by express , and realtime requests are handled by websockets(which are hooked to the http server from which messages are coming)
// app is just a request handler.....express is built on top of the http server itself , just like websockets
// app.listen(3000) actually under the hood , creates a http server(http.createServer(app).listen(3000))
// but here since we are using the websocket server also which is on top of the http server....we cant just write app.listen(3000)
// we have to create the http server and then attach the express app(http.createServer(app).listen(3000)) , and also attach the websocket by 
//     const io=new Server(httpServer,{
//     cors:{
//         origin:"http://127.0.0.1:5500", // client running here....so connecting backend to the client
//         methods:["GET","POST"],
//     }
// })