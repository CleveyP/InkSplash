import React, {useState} from "react";
import "./login.css";
import {socket} from "../../socket";
import {useNavigate} from "react-router-dom";
import Cookies from 'universal-cookie';
 
export const cookies = new Cookies();

export const Login = () =>{

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    

    const handleChange = (e) =>{
        setUsername(e.target.value);
    }

    const handleSubmit = () =>{
        socket.emit("Login", username);
        cookies.set("username", username);
        navigate("/game");
    }

    return (
        <div className="Login">
            <input type='text' className="user-name" value={username} onChange={(e) => handleChange(e)} />
            <button className="submit-btn"
            onClick={handleSubmit}
            >Login</button>
        </div>
    );
}