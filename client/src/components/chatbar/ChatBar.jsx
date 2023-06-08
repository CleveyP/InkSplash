import React, { useState } from "react";
import { socket } from "../../socket";
import { cookies } from "../login/Login";

export const ChatBar = (props) =>{
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

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
        socket.emit("sendMessage", newMessage);
    }

    return (
        <div className="chat-bar" >
            {
                (cookies.get("username")) ? <h1>{`Hello: ${cookies.get("username")}`}</h1> : null
            }
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