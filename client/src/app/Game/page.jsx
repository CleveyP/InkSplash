"use client"

import { useState } from 'react'
import { ChatBar } from '@/component/chatbar/ChatBar'
import { socket } from '@/socket';

export default function Game() {

    const [members, setMembers] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");




    useEffect(() => {

        socket.on("connect", () => {
            console.log("connected!");
        });

        socket.on("recieveRoom", (room) => {
            setMembers([...room.lobby]);
            setRoomId(room.roomId);
            setUsername(room.)
        })

        socket.emit("getUserData");

        socket.on("userJoined", (username, roomNum) => {
            setRoomId(roomNum);
            setUsername(username);
            console.log(username + " " + roomNum);
        })

        socket.on("recieveMessage", (message) => {
            console.log(message.username + " HHHHHH " + message.message);
            setMessages([...messages, message]);
        })
        
        return () => {
            socket.off("connect");
            socket.off("userJoined");
        };


    }, [roomId, text, messages, username]);
    



    return (
        <div className='game-container'>

            <h1>INK SPLASH</h1>

            <div className='game-panel'>

                <div className='members-list'>
                    {members.map((member) => {

                        //Generate a random image for every member
                        let randomIndex = (Math.random() * 100) % imageList.length - 1;
                        let imageURL = imageList[randomIndex];
                        imageList.splice(randomIndex, 1);

                        return(
                            <Member memberName={member.name} randomImage={imageURL} />
                        )
                    }

                    )}
                </div>
                <ChatBar />

            </div>

        </div>


    )
}


const Member = (props) => {

    return (
        <div className='member-card'>
            <h1> {props.memberName} </h1>
            <img src={props.randomImage} alt="userImage" />
        </div>
    )

}
