//represents one room where 2-5 users are playing 



//list of pictionary words
const dictionary = ["horse", "school bus", "car", "fox", "trash can", "leaf blower", "alcohol", "fireworks", "pawn", "poison",
"elements", "elephant", "spinning top", "underscore", "pillow case", "water", "seagull", "farm", "texting"];



class Room{

    constructor(roomId, isPrivate, passCode){
        this.dictionary = dictionary;
        this.isPrivate=isPrivate;
        this.passcode = (isPrivate) ? passCode : "pubic";
        this.roomId=roomId;
        this.lobby = [];
        this.numPlayers=0;
        this.placement=0;
        this.numRounds=3;
        this.currentRound=1;
        this.ActiveIndex=0;
        this.activePlayer=null;
    }


    //return random word from the dictionary of words
    chooseWord() {
        let randomIndex =  (Math.random() * 2000 ) % dictionary.length;
        //get the random word
        let res = dictionary[randomIndex];
        //update the dictionary
        this.dictionary.splice(randomIndex, 1);

        return res;
    }

    addPlayer(user){
        this.lobby.push(user);
        this.numPlayers++;
    }
    //check if the message is the word to be guessed returns true if they did false if it is incorrect.
    checkWord(guess){
        if(guess.word == this.word){
            this.handleCorrectGuess(guess.username);
            return true;
        }
        else{
            //display the message as usual by emitting it
            return false;
        }
    }

    //start a new game with all the players in the lobby
    startGame(){
        for(let i =1; i <= this.numRounds; i++){
            //start the first round
            for(let j = 0; j < this.numPlayers; j++){
                startTurn();
            }
            this.endRound();
            
        }
        endGame();
    }

    endGame(){
        //get the first second and third place players
        let firstIndex=-1, secondIndex=-2, thirdIndex=-3;
        let max1 = -1, max2 = -2, max3 = -3;
        for(let i=0; i<this.numPlayers; i++){
            let currPoints = this.lobby[i].points
            if( currPoints >= max1){
                max3 = max2;
                third = second;
                max2 = max1;
                second = first;
                max1 = currPoints;
                first = i;
            }
            else if(currPoints >= max2){
                max3 = max2;
                third=second;
                second = i;
                max2=currPoints;
            }
            else if(currPoints > max3){
                max3 = currPoints;
                third=i;
            }
            winnersNames =  [this.lobby[first].name, this.lobby[second].name, this.lobby[third].name || ""];
            //display these winning names to everyone in the room.
            
        }
        //reset all game state in the class instance
        this.placement=0;
        this.currentRound=1;
        this.ActiveIndex=0;
        this.activePlayer=null;


    }
    getActivePlayer(){
        //go to next active player
        this.activeIndex = (this.activeIndex+1) % this.numPlayers;
        //set the player to be a drawer
        this.lobby[activeIndex].isDrawer = true;
        //update the class's active player field.
        this.activePlayer =  this.lobby[activeIndex];
    }

    startTurn(){
       
       
        //select active player
       let activePlayer =  this.getActivePlayer();
        //give player 3 words to choose from
        let words = [];
        words.push(chooseWord());
        words.push(chooseWord());
        words.push(chooseWord());
        //emit this word choice to frontend
        //await recieving the word choice somehow TODO find out if we can wait.
       // let wordChoice = await wordChoice();
        //recieve the choice
        recieveWordChoice(wordChoice);
        //start the turn timer
         //so put the rest of this function in a setTimeout() 
        //allow player to draw
        //listen for correct guesses
        //after the timer
        //display the word to everyone
        displayWord(this.word);
    }

    displayWord(){
        //emit an event to everyone in the room that shows: The word was:  this.word
    }


    recieveWordChoice(word){
        //set the word as the word choice
        this.word = word;
        //display the number of underscores for the word 
        
        //(from here until the turn ends, only check messages against the word when the message is the same length as the word including spaces)
    }


    endRound(){
        this.currentRound++;
        //display the new round number
    }

    handleCorrectGuess(username){
        //increment the amount of correct guesses at this word in this turn
        this.placement++;
        console.log(`${username} guessed the correct word!`);
        //emit a message so everyone can see that someone guessed the word
        //get the user from the lobby 
        for(let i =0; i< this.numPlayers; i++){
            if(lobby[i].username == username){
                //update their points based on placement of the correct answer
                lobby[i].points += 400 / this.placement;
            }
        }
    }
}


module.exports = {Room};