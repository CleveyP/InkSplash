import React, {useState} from "react";
import "./login.css";
import {socket} from "../../socket";
import {useNavigate} from "react-router-dom";
import Cookies from 'universal-cookie';
 
export const cookies = new Cookies();

export const Login = () =>{

    const navigate = useNavigate();
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
        cookies.set("username", username);
        cookies.set("roomNumber", roomNum);
        navigate(`/game?roomId=${roomNum}`);
    }

    return (
        <div className="Login">
            <input required type='text' className="username-input" value={username} onChange={(e) => handleChange(e)} />
            <input type="number" className="room-input" value = {roomNum} onChange={e => handleRoomChange(e)} />
            <button className="submit-btn"
            onClick={handleSubmit}
            >Login</button>
        </div>
    );
}