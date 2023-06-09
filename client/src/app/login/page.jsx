
"use client"

import React, {useState} from "react";
import "./login.css";
import { socket } from "@/socket";
import { useRouter } from 'next/navigation'


export default function Login(){

    const router = useRouter();

    const [username, setUsername] = useState("");
    const [roomNum, setRoomNum] = useState(0);

    const handleChange = (e) =>{
        setUsername(e.target.value);
    }
    const handleRoomChange = (e) =>{
        setRoomNum(e.target.value);
    }

    const handleSubmit = () =>{
        socket.emit("Login", username, roomNum);
        router.push(`/`);
    }

    return (
        <div className="Login">
            <input required type='text' className="username-input" value={username} onChange={(e) => handleChange(e)} />
            <input type="text" className="room-input" value = {roomNum} onChange={e => handleRoomChange(e)} />
            <button className="submit-btn"
            onClick={handleSubmit}
            >Login</button>
        </div>
    );
}