const {Server}=require('socket.io')

const io=new Server(3000,{
    cors:{
        origin:"http://127.0.0.1:5500", // client running here....so connecting backend to the client
        methods:["GET","POST"],
    }
})

const users={};

io.on('connection',socket=>{
    //console.log("new user");
    //socket.emit('chat-message-to-console','Hello this is pranetha');
    socket.on('new-user',username=>{
        users[socket.id]=username; // socket.id is a unique identiifier for each client connected to the socket
        socket.broadcast.emit('user-connected',username);
        console.log(users);
    })

    socket.on('send-chat-message',message=>{
        //console.log(message);

        // send it to everyone on that server , except the person who sent it
        socket.broadcast.emit('chat-message',{username:users[socket.id],message:message});
    })

    //when user disconnects
    socket.on('disconnect',()=>{
        socket.broadcast.emit('user-disconnected',users[socket.id]);
        delete users[socket.id];
    })
})

