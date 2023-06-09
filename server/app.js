 const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
        }
    });

    io.on("connection", (socket) =>{
        console.log(socket.id);

        socket.on("Login", (username, roomNum) => {
            if(roomNum != ""){
                //add this person to a room
                socket.join(roomNum);
                socket.emit("userJoined", username, roomNum);
                console.log(username + " " + roomNum);
            }
            console.log("The user with socket id: " + socket.id + "logged on as: " + username)
        });

        socket.on("sendMessage", (message, roomId) =>{
            console.log("got message: " + message.username + " " + message.message + " " + roomId);
            if(roomId == 0)
                socket.broadcast.emit("recieveMessage", (message.username, message.message));
            else 
                socket.to(roomId).emit("recieveMessage", (message.username, message.message));
        })
    });