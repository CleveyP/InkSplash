'use client'

import React, { useState } from "react";
import { socket } from "../../socket";
import { cookies } from "next/dist/client/components/headers";


export const ChatBar = (props) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    console.log(roomId);
    
    socket.on("connect", () => {
        console.log("connected!");
    });

    socket.on("userJoined", (username, roomNum) => {
        setRoomId(roomNum);
        setUsername(username);
        console.log(username + " " + roomNum);
    })

    socket.on("recieveMessage", (username, text) => {
        const newMessage = { username: username, message: text };
        setMessages([...messages, newMessage]);
    })

    const handleChange = (e) => {
        setText(e.target.value);
    }

    const sendMessage = () => {
        const newMessage = { username: username + "A", message: text };
        setMessages([...messages, newMessage]);
        socket.emit("sendMessage", newMessage, roomId);
    }

    return (
        <div className="chat-bar" >
            {
                <h1>{`Hello: ${username}`}</h1>
            }
            <h2>{`Room  ID: ${roomId}`}</h2>
            {
                messages.map(message => {

                    return <Message message={message.message} name={message.username} />
                })
            }
            <input className="chat-input" value={text} onChange={e => handleChange(e)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    )
}

const Message = (props) => {

    return (
        <div className="message">
            <p className="username-p">{props.name}</p>
            <p className="message-p">{props.message}</p>
        </div>
    )
}