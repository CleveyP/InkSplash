const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});


const { Room } = require("./Classes/RoomClass");
const { User } = require("./Classes/UserClass");


//this hashmap contains all active rooms
let publicRooms = new Map();
let privateRooms = new Map();

let globalRoom;
let user_name;

io.on("connection", (socket) => {

    socket.on("sendMessage", (message, roomId) => {
        console.log("got message: " + message.username + " " + message.message + " " + roomId);
        if (roomId == 0) { //user is not in any one devoted room
            socket.broadcast.emit("recieveMessage", (message.username, message.message));
        }
        else {
            console.log("sending message to non defualt room: " + roomId + "message is: " + message.message);
            socket.to(roomId).emit("recieveMessage", (message));
        }
    });


    socket.on("createRoom", (username, isPrivate, passcode) => {

        console.log("TRYNNA CREATE ROOM");

        //generate room number
        let roomNum = (publicRooms.size + privateRooms.size + 1).toString(10);

        let newRoom;

        if (isPrivate) {
            if (passcode == "") {
                socket.emit("noPasscodeError");
            }

            //create the room
            newRoom = new Room(roomNum, true, passcode);
            //add the player to the room

            newRoom.addPlayer(username, socket.id);
            //add the room to the private rooms
            privateRooms.set(roomNum.toString(10), newRoom);
        }
        else {
            //the room is public
            console.log("creating public room with id: " + roomNum);

            //create the room
            newRoom = new Room(roomNum, false);
            //add the player to the room
            newRoom.addPlayer(username, socket.id);
            //add the room to the private rooms
            publicRooms.set(roomNum.toString(10), newRoom);
        }
        socket.join(roomNum);
        globalRoom = newRoom;
        user_name = username;

    });
    //emitted when user creates a game
    socket.on('arrivedAtGame', () => {
      

        //socket.to(globalRoom.roomId).emit("recieveRoom", { room: globalRoom, username: user_name });
        io.to(socket.id).emit("recieveRoom", { room: globalRoom, username: user_name, socketId: socket.id });

        console.log([...publicRooms.entries()] + " THIS IS NEW ROOM")
    })

    socket.on("joinRoom", (username, roomNum, passcode) => {
        let room;
        if (passcode) { //room is private
            //check if the room exists
            if (privateRooms.has(roomNum)) {
                //check if the passcode is correct
                room = privateRooms.get(roomNum);

                if (room.passcode == passcode) {
                    //create the user object
                    const newUser = User(username, socket.id);
                    //put the user in the private room
                    room.addPlayer(newUser);
                    //set the placeholder room and username
                    globalRoom=room;
                    user_name=username;
                    //have the new user join the room socket
                    socket.join(roomNum);
                    //tell the room that the new player has entered
                    socket.to(roomNum).emit("recieveMessage", {username: "ADMIN", message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                    //possibly render a card component that shows the user
                }
                else {
                    socket.emit("privateRoomReject");
                    return;
                }
            }
        }
        else if (!passcode && roomNum) {
            console.log(username + " is joining public room with room num "+ roomNum);
            //room is public and user wants to join custom room
           
            if (publicRooms.has(roomNum)) {
                room = publicRooms.get(roomNum);
                const newUser = new User(username, socket.id);
                room.addPlayer(newUser);
                console.log(...room.lobby);
                globalRoom=room;
                user_name=username;
                socket.join(roomNum);
                socket.to(roomNum).emit("recieveMessage", { username: "ADMIN", message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                //possibly render a card component that shows the user
            
            }
        }
        else {// the user wants to join a random room
            //find the public room that has the most players in it
            for (let [key, value] of publicRooms) {
                console.log(key + " = " + value);
                if (value.numPlayers < 5) {
                    //found a room put the user in that room
                    room = publicRooms.get(value.roomId);
                    const newUser = User(username, socket.id);
                    room.addPlayer(newUser);
                    globalRoom=room;
                    user_name=username;
                    socket.join(roomNum);
                    socket.to(roomNum).emit("recieveMessage", { message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                    //possibly render a card component that shows the user
                    //socket.emit("playEvent" (username));

                    return;
                }
            }
            socket.emit("noRoomsAvailable");
        }

        // socket.once("arrivedAtGame", () => {
        //     socket.emit("recieveRoom", { room: newRoom, username: username });
        // })

    });
});