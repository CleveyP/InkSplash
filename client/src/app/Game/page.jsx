"use client"

import { useState , useEffect} from 'react'
import { ChatBar } from '@/component/chatbar/ChatBar'
import { socket } from '@/socket';
import Modal from "react-modal";
export default function Game(props) {

    const [members, setMembers] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [wordChoices, setWordChoices] = useState([]);
    const imageList = [
        'https://p.turbosquid.com/ts-thumb/yO/7hrBI5/Cp/cartoon_male_head_cd0008/jpg/1616116047/1920x1080/fit_q87/a046278447828841ba8138da552ac3b4775472ec/cartoon_male_head_cd0008.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWPCg6OMtBQf5gtN6e00gGIwndV8cEFTyWHDXF6nbPu1jsyAi0nmQdmEevDC1WUL2oPJw&usqp=CAU',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs_44O-CJ_DFbw4cjty2wR7Rtsh83dJs6k4w&usqp=CAU',
        'https://c8.alamy.com/comp/2ATH5M7/colourful-male-face-circle-in-flat-style-cartoon-vector-icon-modern-design-men-face-person-silhouette-avatar-profile-round-portrait-isolated-2ATH5M7.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDXUGmkMYd2YeOsOZxz7iW2u9SI3nIto8kolWmCrUC52c4zWgpVQmfyHIXsSoRAbQ8KT4&usqp=CAU'
    ]

    useEffect(() => {

        socket.emit("arrivedAtGame");
        
        socket.on("recieveRoom", (room) => {
            if(room.room.roomId === roomId || roomId === "") {
                console.log(JSON.stringify(room.room)); 
                setMembers([...room.room.lobby]);
                setUsername(room.username);
                setRoomId(room.room.roomId);
                
            }

        });



        socket.on("updateRoom", (room) =>{
            setMembers([...room.lobby]);
        });

        socket.on("wordPrompt", (words) =>{
           //open modal that will get the one word chosen by user and emit word back to the backend
           setWordChoices([...words]);
            openModal();
        })

    }, []);
    

    //-------------------------------------------FOR WORD SELECTION MODAL--------------------------------------------------------
    function openModal() {
        setIsOpen(true);
      }
    
      function closeModal() {
        setIsOpen(false);
      }

      const handleSelectWord =(e) =>{
        
        let word = e.target.value;
        //emit this selected word back to the backend
        socket.emit("selectedWord", (word, roomId));
        //and close the modal
        closeModal();
      }

    //---------------------------------------------END WORD SELECTION MODAL----------------------------------------------------------


    const handleStartGame = () =>{
        socket.emit("startGame", roomId);
    }


    return (
        <div className='game-container'>

            <h1>INK SPLASH: {username} + {roomId}</h1>

            <div className='game-panel'>

                <div className='members-list'>
                    {members.map((member) => {

                        //Generate a random image for every member
                        let randomIndex = ((Math.floor(Math.random() * 100))) % (imageList.length);
                        console.log(randomIndex + " RANDO");
                        let imageURL = imageList[randomIndex];
                        //remove that image from the image list so no other user in the room gets it.
                        imageList.splice(randomIndex, 1);

                        return(
                            <Member memberName={member.name} randomImage={imageURL} />
                        )
                    }

                    )}
                </div>
                <ChatBar username={username} roomId ={roomId} />
                <button className="start-game-button" onClick={handleStartGame}>Start Game</button>




                <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                >
                    <h2>Select One of These Three Words</h2>
                    <button onClick={closeModal}>close</button>
                    <div className="word-selection-container">
                        {
                            wordChoices.map((word, index) =>{
                                return (
                                    <button
                                    className="word-choice-button" 
                                    value={word}
                                    key={index}
                                    onClick={e => handleSelectWord(e)}
                                    >
                                        {word}
                                    </button> 
                                )
                            })
                        }
                    </div>
                </Modal>
            </div>

        </div>


    )
}


const Member = (props) => {

    return (
        <div className='member-card'>
            <h1> {props.memberName} </h1>
            <img src={props.randomImage} alt="userImage" style={{height: "50px"}}/>
        </div>
    )

}
