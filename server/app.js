 const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
        }
    });

    io.on("connection", (socket) =>{
        console.log(socket.id);

        socket.on("Login", (username) => console.log("The user with socket id: " + socket.id + "logged on as: " + username));

        socket.on("sendMessage", ({username, message}) =>{
            console.log("got message: " + username + " " + message);
            socket.broadcast.emit("recieveMessage", (username, message));
        })
    });