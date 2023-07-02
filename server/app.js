const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});


const { User } = require("./Classes/UserClass");


//these hashmap contains all active rooms. The keys are the room numbers, the values are the corresponding room objects
let publicRooms = new Map();
let privateRooms = new Map();

//placeholders that hold the name and room of someone switching from home page to game page
let globalRoom;
let user_name;

//all socket io code must go inside here 
//TODO: detect when player leaves room and handle this.
io.on("connection", (socket) => {

    socket.on("sendMessage", (message, roomId) => {
        console.log("got message: " + message.username + " " + message.message + " " + roomId);
        if (roomId == 0) { //user is not in any one devoted room
            socket.broadcast.emit("recieveMessage", (message.username, message.message));
        }
        else {
            console.log("sending message to non defualt room: " + roomId + "message is: " + message.message);
            //get the room from the public or private room map
            let room = privateRooms.get(roomId) || publicRooms.get(roomId);
            if(!room){
                console.log("could not locate the room in either of the rooms maps.");
            }
            //check the word for correctness/ display the message if it is an incorrect word guess or if it is a message and not a guess
            room.checkWord(message.message, message.username);
              
            
        }
    });


    socket.on("createRoom", (username, isPrivate, passcode) => {

        //generate room number
        let roomNum = (publicRooms.size + privateRooms.size + 1).toString();
      
        let newRoom;

        if (isPrivate) {
            if (passcode == "") {
                socket.emit("noPasscodeError");
            }

            //create the room
            newRoom = new Room(roomNum, true, passcode);
            //add the player to the room
            const newUser = new User(username, socket.id);
            newRoom.addPlayer(newUser);
            //add the room to the private rooms
            privateRooms.set(roomNum, newRoom);
        }
        else {
            //the room is public
            console.log("creating public room with id: " + roomNum);

            //create the room
            newRoom = new Room(roomNum, false);
            //add the player to the room
            const newUser = new User(username, socket.id);
            newRoom.addPlayer(newUser);
            //add the room to the public rooms
            publicRooms.set(roomNum, newRoom);
        }
        socket.join(roomNum);
        globalRoom = newRoom;
        user_name = username;

    });
    //emitted when user creates a game
    socket.on('arrivedAtGame', () => {
      

        //socket.to(globalRoom.roomId).emit("recieveRoom", { room: globalRoom, username: user_name });
        io.to(socket.id).emit("recieveRoom", { room: globalRoom, username: user_name, socketId: socket.id });

        console.log([...publicRooms.entries()] + " THIS IS NEW ROOM");
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
                    socket.join(roomNum.toString());
                    //tell the room that the new player has entered
                    socket.to(roomNum).emit("recieveMessage", {username: "ADMIN", message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                    //update the room that every preexisting room member has to now include the new player
                    socket.to(roomNum).emit("updateRoom", room);
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
               //update the room that every preexisting room member has to now include the new player
                socket.to(roomNum).emit("updateRoom", room);
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
                    socket.to(roomNum).emit("recieveMessage", {username: "ADMIN", message: `${username} has entered the room! Only ${5 - room.numPlayers} spots are left.` });
                    //possibly render a card component that shows the user
                    //socket.emit("playEvent" (username));

                    return;
                }
            }
            socket.emit("noRoomsAvailable"); //TODO create listener in frontend for this event
        }

        // socket.once("arrivedAtGame", () => {
        //     socket.emit("recieveRoom", { room: newRoom, username: username });
        // })

    });

    socket.on("startGame", (roomId) =>{
        //find the room in the maps
        let room = publicRooms.get(roomId) || privateRooms.get(roomId);
        if(!room){
            //should never happen 
            console.log("could not find the room in either of the room maps.");
            socket.to(roomId).emit("recieveMessage", {username: "ADMIN", message: "unknown error occurred starting game."})
            return;
        }
        //make sure that the room has at least two players in it
        if(room.numPlayers < 2){
            console.log("not enough players to start game.");
            io.to(roomId).emit("recieveMessage", {username: "ADMIN", message: "Not enough players to start the game"});
            return;
        }
        //call its start game function
        room.startGame();
    })



    //--------------------------------------------ROOM CLASS--------------------------------------------------------------------------------

    //represents one room where 2-5 users are playing 



//list of pictionary words
const dictionary = ["horse", "school bus", "car", "fox", "trash can", "leaf blower", "alcohol", "fireworks", "pawn", "poison",
"elements", "elephant", "spinning top", "underscore", "pillow case", "water", "seagull", "farm", "texting"];



class Room{

    constructor(roomId, isPrivate, passCode){
        this.dictionary = dictionary;
        this.isPrivate=isPrivate;
        this.passcode = (isPrivate) ? passCode : "pubic";
        this.roomId=roomId.toString();
        this.lobby = [];
        this.numPlayers=0;
        this.placement=0;
        this.numRounds=3;
        this.currentRound=1;
        this.activeIndex=0;
        this.activePlayer=null;
        this.word="";
    }

    addPlayer(user){
        this.lobby.push(user);
        this.numPlayers++;
    }


    //return random word from the dictionary of words
    chooseWord() {
        let randomIndex =  (Math.random() * 2000 ) % (dictionary.length-1);
        //get the random word
        let res = dictionary[randomIndex];
        //update the dictionary
        this.dictionary.splice(randomIndex, 1);

        return res;
    }

   
    //check if the message is the word to be guessed. returns true if correct false if it is incorrect.
    checkWord(guess, username){
        
        if(this.word == ""){
            //the word has not been set so we are between turns or rounds
            //in which case, treat the word as not a guess but a message and display it
           //sends to everyone INCLUDING sender
            io.sockets.in(this.roomId).emit('recieveMessage', {username: username, message: guess});
            return false;
        }
        if(guess == this.word){
            this.handleCorrectGuess(username);
            return true;
        }
        else{
            //display the message as usual by emitting it
            socket.to(this.roomId).emit("recieveMessage", { username: username, message: guess});
            return false;
        }
    }

    //start a new game with all the players in the lobby
    //https://stackoverflow.com/questions/19714453/calling-settimeout-in-a-loop-not-working-as-expected check this out if it doesnt work as expected
    startGame(){
        //display that this is the first round
        socket.to(this.roomId).emit("updateRoundNumber", this.currentRound); //TODO create listener in frontend for this event

        //for every round
        for(let i =1; i <= this.numRounds; i++){
            //start the current round and let everyone have a turn drawing
            for(let j = 0; j < this.numPlayers; j++){
                this.startTurn(); // < might need to be wrapped in self calling function, check link above
            }
            //after everyone has gone, the round ends
            this.endRound();
            
        }
        //after all rounds have finished, the game ends
        this.endGame();
    }

    endGame(){
        //get the first second and third place players
        let firstIndex=-1, secondIndex=-2, thirdIndex=-3;
        let max1 = -1, max2 = -2, max3 = -3;
        for(let i=0; i<this.numPlayers; i++){
            let currPoints = this.lobby[i].points
            if( currPoints >= max1){
                max3 = max2;
                thirdIndex = secondIndex;
                max2 = max1;
                secondIndex = firstIndex;
                max1 = currPoints;
                firstIndex = i;
            }
            else if(currPoints >= max2){
                max3 = max2;
                thirdIndex=secondIndex;
                secondIndex = i;
                max2=currPoints;
            }
            else if(currPoints > max3){
                max3 = currPoints;
                thirdIndex=i;
            }
            winnersNames =  [this.lobby[firstIndex].name, this.lobby[secondIndex].name, ( thirdIndex >=0 && thirdIndex < this.numPlayers) ? this.lobby[thirdIndex].name : ""];
            //display these winning names to everyone in the room.
            socket.to(this.roomId).emit("displayWinners", winnersNames); //TODO create listener in frontend for this event
        }
        //reset game state in the room instance
        this.placement=0;
        this.currentRound=1;
        this.ActiveIndex=0;
        this.activePlayer=null;
        this.word = "";

    }
    getActivePlayer(){
        //go to next active player
        this.activeIndex = (this.activeIndex+1) % (this.numPlayers);
        console.log(" the active index is: " + this.activeIndex);
        //set the player to be a drawer
        this.lobby[this.activeIndex].isDrawer = true;
        //update the class's active player field.
        this.activePlayer =  this.lobby[this.activeIndex];
    }

    startTurn(){
       
        //select active player
        this.getActivePlayer();
        console.log("starting turn where "+ this.activePlayer.name + " is the active player")
        //give player 3 words to choose from
        let words = [];
        words.push(this.chooseWord());
        words.push(this.chooseWord());
        words.push(this.chooseWord());
        //emit this word choice to frontend
        socket.to(this.activePlayer.socketId).emit("wordPrompt", words); // TODO: create the listener in frontend
        
        let wordChoice = words[1];

          //wait for user to emit a selectWord event (changing the word from the default) for 10 seconds
           //TODO: create an event emitter selectedWord in frontend that sends the selected word back
        socket.on("selectedWord", (word) =>{
            wordChoice = word;
           });

        setTimeout(() => {
         
          
           //...waiting

           //stop  listening for the user to select a word -- as they have run out of time to select one
           socket.off("selectedWord");

           recieveWordChoice(wordChoice);
           //start the turn timer
           setTimeout(() => {
              //allow player to draw
              //listen for correct guesses
             //after the timer
             //display the word to everyone
             displayWord(this.word);
           }, 1000 * 60 * 2); //a turn lasts 2 minutes
          
        }, 1000 * 10); //wait for 10 seconds
    }

    displayWord(word){
        //emit an event to everyone in the room that shows: The word was:  this.word
        socket.to(this.roomId).emit("recieveMessage", { username: "ADMIN", message: `The word was ${word}` });
       //set the active player to inactive again
       this.activePlayer.isDrawer = false; 
    }


    recieveWordChoice(word){
        //set the word as the word choice
        this.word = word;
        //display the number of underscores for the word 
        socket.to(this.roomId).emit("setUnderscores", word.length); //TODO create listener in frontend for this event
        //(from here until the turn ends, only check messages against the word when the message is the same length as the word including spaces)
    }


    endRound(){
        this.currentRound++;
        //display the new round number
        socket.to(this.roomId).emit("updateRoundNumber", this.currentRound); //TODO create listener in frontend for this event
    }

    handleCorrectGuess(username){
        //increment the amount of correct guesses at this word in this turn
        this.placement++;
        console.log(`${username} guessed the correct word!`);
        //emit a message so everyone can see that someone guessed the word
        socket.to(roomId).emit('recieveMessage', {username: "ADMIN", message: `${username} guessed the word!`});
        //get the user from the lobby 
        for(let i =0; i< this.numPlayers; i++){
            if(lobby[i].username == username){
                //update their points based on placement of the correct answer
                lobby[i].points += 400 / this.placement;
            }
        }
    }
}


//--------------------------------------------END ROOM CLASS--------------------------------------------------------------------------------



});

