//represents one room where 2-5 users are playing 

//list of pictionary words
const dictionary = ["horse", "school bus", "car"];



class Room{

    constructor(roomId, isPrivate, passCode){
        this.dictionary = dictionary;
        this.isPrivate=isPrivate;
        this.passcode = (isPrivate) ? passCode : "pubic";
        this.roomId=roomId;
        this.lobby = [];
        this.numPlayers=0;
        let randomIndex =  (Math.random() * 2000 ) % dictionary.length;
        this.word = dictionary[randomIndex];
        //update the dictionary
        this.dictionary.splice(randomIndex, 1);
    }

    addPlayer(user){
        this.lobby.push(user);
        this.numPlayers++;
    }
    
    checkWord(guess){
        if(guess.word == this.word){
            this.handleCorrectGuess(guess.username);
        }
    }

    handleCorrectGuess(username){
        console.log(`${username} guessed the correct word!`);
    }
}


module.exports = {Room}