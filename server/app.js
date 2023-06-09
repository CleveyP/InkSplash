const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});

const {publicRooms, privateRooms} = require("./rooms");
const {Room} = require("./Classes/RoomClass");
const {User} = require("./Classes/UserClass")

io.on("connection", (socket) => {

    console.log(socket.id);

    let user_name = "";
    let room_Num = "";

    socket.on("Login", (username, roomNum) => {
        if (roomNum != "") {
            //add this person to a room
            user_name = username;
            room_Num = roomNum;
            socket.emit("userConnected");
            socket.join(roomNum);
        }
    });

    socket.on("getUserData", () => {
        socket.emit("userJoined", user_name, room_Num);
    });

    socket.on("sendMessage", (message, roomId) => {
        console.log("got message: " + message.username + " " + message.message + " " + roomId);
        if (roomId == 0) { //user is not in any one devoted room
            socket.broadcast.emit("recieveMessage", (message.username, message.message));
        }
        else{
            socket.to(roomId).emit("recieveMessage", (message));
        }
    });

    socket.on("joinRoom", (username, roomNum, isPrivate, passcode) =>{
        if(isPrivate){
        //check if the room exists
        if(privateRooms.has(roomNum)){
            //check if the passcode is correct
            const room = privateRooms.get(roomNum);
            if(room.passcode == passcode){
                //create the user object
                const newUser = User(username, socket.id);
                //put the user in the private room
                room.addPlayer(newUser);
                //tell the room that the new player has entered
                socket.to(roomNum).emit("recieveMessage", {message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.`});
                //possibly render a card component that shows the user
            }
            else{
                socket.emit("privateRoomReject");
                return;
            }
        }
    }
    else{
        //room is public
         if(publicRooms.has(roomNum)){
            const room = publicRooms.get(roomNum);
            const newUser = User(username, socket.id);
            room.addPlayer(newUser);
            socket.to(roomNum).emit("recieveMessage", {message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.`});
            //possibly render a card component that shows the user
        }
    }
    });
});