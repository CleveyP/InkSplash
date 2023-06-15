const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});

const { publicRooms, privateRooms } = require("./rooms");
const { Room } = require("./Classes/RoomClass");
const { User } = require("./Classes/UserClass");

let globalRoom;
let user_name;

io.on("connection", (socket) => {



    console.log(socket.id + " 11111111111111111111111111111");

    // let room_Num = "";

    // socket.on("play", (username, roomNum) => {
    //     if (roomNum != "") {
    //         //add this person to a room
    //         // user_name = username;
    //         // room_Num = roomNum;
    //         // socket.emit("userConnected");
    //         socket.join(roomNum);
    //     }
    // });

    // socket.on("getUserData", () => {
    //     socket.emit("userJoined", user_name, room_Num);
    // });

    socket.on("sendMessage", (message, roomId) => {
        console.log("got message: " + message.username + " " + message.message + " " + roomId);
        if (roomId == 0) { //user is not in any one devoted room
            socket.broadcast.emit("recieveMessage", (message.username, message.message));
        }
        else {
            socket.to(roomId).emit("recieveMessage", (message));
        }
    });


    socket.on("createRoom", (username, isPrivate, passcode) => {

        console.log("TRYNNA CREATE ROOM")

        //generate room number
        let roomNum = (publicRooms.size + privateRooms.size + 1);

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
            privateRooms.set(roomNum, newRoom);
        }
        else {
            //the room is public
            console.log("THE ROOM APPREAS TO BE PUBLICS")

            //create the room
            newRoom = new Room(roomNum, false);
            //add the player to the room
            newRoom.addPlayer(username, socket.id);
            //add the room to the private rooms
            publicRooms.set(roomNum, newRoom);
        }

        socket.join(roomNum);

        globalRoom = newRoom;
        user_name = username;

    });

    socket.on('arrivedAtGame', () => {
        console.log(user_name + " THIS IS A USER NAME")

        //socket.to(globalRoom.roomId).emit("recieveRoom", { room: globalRoom, username: user_name });
        io.to(socket.id).emit("recieveRoom", { room: globalRoom, username: user_name, socketId: socket.id });

        console.log("PLUTOS IDEA IS WORKING?")
        console.log(JSON.stringify(globalRoom) + " THIS IS NEW ROOM")
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
                    //tell the room that the new player has entered
                    socket.to(roomNum).emit("recieveMessage", { message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                    //possibly render a card component that shows the user
                }
                else {
                    socket.emit("privateRoomReject");
                    return;
                }
            }
        }
        else if (!passcode && roomNum) {
            //room is public and user wants to join custom room
            if (publicRooms.has(roomNum)) {
                room = publicRooms.get(roomNum);
                const newUser = User(username, socket.id);
                room.addPlayer(newUser);
                socket.to(roomNum).emit("recieveMessage", { message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                //possibly render a card component that shows the user
                //socket.emit("createRoomEvent" (username));
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