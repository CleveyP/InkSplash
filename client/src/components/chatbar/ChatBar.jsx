import React, { useState } from "react";
import { socket } from "../../socket";
import { cookies } from "../login/Login";
import { useSearchParams } from "react-router-dom";


export const ChatBar = (props) =>{
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");

    console.log(roomId);
    socket.on("connect", () =>{
        console.log("connected!");
    });

    socket.on("recieveMessage", (username, text) =>{
        const newMessage = {username: username, message: text};
        setMessages([...messages, newMessage]);
    })
    
    const handleChange = (e) =>{
        setText(e.target.value);
    }

    const sendMessage = () =>{
        const newMessage = {username: cookies.get("username"), message: text};
        setMessages([...messages, newMessage]);
        socket.emit("sendMessage", newMessage, roomId);
    }

    return (
        <div className="chat-bar" >
            {
                (cookies.get("username")) ? <h1>{`Hello: ${cookies.get("username")}`}</h1> : null
            }
            <h2>{`Room  ID: ${roomId}`}</h2>
            {
                messages.map( message =>{

                   return <Message message={message.message} name={message.username}/>
                })
            }
            <input className="chat-input" value = {text} onChange={e => handleChange(e)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    )
}

const Message = (props) =>{

    return (
        <div className="message">
            <p className="username-p">{props.name}</p>
            <p className="message-p">{props.message}</p>
        </div>
    )
}