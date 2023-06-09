//class that represents one connected user

class User{

    constructor(username, socketId){
        this.name=username;
        this.socketId = socketId;
        this.points = 0;
        this.isDrawer = false;
    }
}

module.exports={User};