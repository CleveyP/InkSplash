const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});

io.on("connection", (socket) => {

    console.log(socket.id);

    let user_name = "";
    let room_Num = "";

    socket.on("Login", (username, roomNum) => {
        if (roomNum != "") {
            //add this person to a room
            user_name = username;
            room_Num = roomNum;
            console.log(user_name + " " + room_Num)
            socket.emit("userConnected");
            socket.join(roomNum);
        }
        console.log("The user with socket id: " + socket.id + "logged on as: " + username)
    });

    socket.on("getUserData", () => {
        //console.log("AHEL")

        socket.emit("userJoined", user_name, room_Num);
        //console.log(user_name + " " + room_Num)

    })


    socket.on("sendMessage", (message, roomId) => {
        console.log("got message: " + message.username + " " + message.message + " " + roomId);
        if (roomId == 0) {
            console.log("EHEasdasdasdHEH")
            socket.broadcast.emit("recieveMessage", (message.username, message.message));

        }else{
            console.log(message.username + " 11111111 " + roomId + " " + message.message);
            socket.to(roomId).emit("recieveMessage", (message));
        }
    })
});