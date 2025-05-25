// client side

// the io is pulled from the socket.io.js from , included in index.html
const socket=io('http://localhost:3000') // the place where backend is running

const messageContainer=document.getElementById('message-container');
const messageForm=document.getElementById('send-container');
const messageInput=document.getElementById('message-input');

const appendMessage=message=>{
    const messageElement=document.createElement('div');
    messageElement.innerText=message;
    messageContainer.append(messageElement);
}

if(messageForm) // ensures does not prompt in index.ejs,and does this only when room.ejs is rendered
{
    let username=" "
    while(!username || username.trim()==='')username=prompt('What is your name?')
    appendMessage('You joined')
    socket.emit('new-user',roomName,username);

    messageForm.addEventListener('submit',e=>{
        e.preventDefault();
        const message=messageInput.value;
        socket.emit('send-chat-message',roomName,message);
        appendMessage(`You : ${message}`);
        messageInput.value='';
    })
}
//else {console.log("messageform not found")};

socket.on('chat-message',data=>{ // recieving the message sent from server.js and then consoling it
    //console.log(data)
    appendMessage(`${data.username} : ${data.message}`);
})

socket.on('user-connected',username=>{ // recieving the message sent from server.js and then consoling it
    //console.log(data)
    appendMessage(`${username} has connected`);
})

socket.on('user-disconnected',username=>{ // recieving the message sent from server.js and then consoling it
    //console.log(data)
    appendMessage(`${username} has disconnected`);
})



const roomContainer=document.getElementById('room-container');
socket.on('room-created',room=>{
    const roomElement=document.createElement('div');
    roomElement.innerText=room;
    const roomLink=document.createElement('a');
    roomLink.href=`/${room}`;
    roomLink.innerText='join';
    roomContainer.append(roomElement);
    roomContainer.append(roomLink);
})