"use client"

import React, { useState } from "react";
import "./home.css";
import { socket } from "@/socket";
import { useRouter } from 'next/navigation'

const Home = () => {

    const [username, setUsername] = useState("");
    const [roomNum, setRoomNum] = useState();
    const [isPrivate, setIsPrivate] = useState(false);
    const [passcode, setPasscode] = useState(0);

    const router = useRouter();

    const handleChange = (e) => {
        setUsername(e.target.value);
    }
    const handleRoomChange = (e) => {
        setRoomNum(e.target.value);
    }

    const handlePlay = () => {
        socket.emit("joinRoom", (username))
        router.push('/Game' );
        //change the view component to the room component
    }

    const handleCreateRoom = () => {
        socket.emit("createRoom", username, isPrivate, passcode);
        router.push('/Game' ); //get rid of it
    }


    const handleJoinRoom = () => {
        socket.emit("joinRoom", username, roomNum, passcode);        
        router.push('/Game' ); //get rid of it
    }



    return (
        <div className="Login">
            <input required type='text' className="username-input" value={username} onChange={(e) => handleChange(e)} />
            <input type="text" className="room-input" value={roomNum} onChange={e => handleRoomChange(e)} />
            <button className="submit-btn"
                onClick={handlePlay}
            >Play</button>

            <button className="submit-btn"
                onClick={handleCreateRoom}
            >Create Room</button>

            <button className="submit-btn"
                onClick={handleJoinRoom}
            >Join Room</button>

        </div>
    );
}


export default Home;