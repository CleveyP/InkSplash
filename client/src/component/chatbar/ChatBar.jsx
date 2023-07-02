'use client'

import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import "./chatbar.css";
export const ChatBar = (props) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {

        socket.on("connect", () => {
            console.log("connected!");
        });

        // socket.emit("getUserData");

        // socket.on("userJoined", (username, roomNum) => {
        //     setRoomId(roomNum);
        //     setUsername(username);
        //     console.log(username + " " + roomNum);
        // })

        socket.on("recieveMessage", (message) => {
            console.log(message.username + " HHHHHH " + message.message);
            setMessages(messages => [...messages, message]);
        })
        

    }, []);

    const handleChange = (e) => {
        setText(e.target.value);
    }

    const sendMessage = () => {
        const newMessage = {username: props.username,  message: text };
       // setMessages([...messages, newMessage]);
        socket.emit("sendMessage", newMessage, props.roomId);
        setText("");
    }


    return (
        <div className="chat-bar" >
            {
                <h1>{`Hello: ${props.username}`}</h1>
            }
            <h2>{`Room  ID: ${props.roomId}`}</h2>
            {
                messages.map(message => {
                    return <Message name={message.username} message={message.message} isAdmin={message.username == "ADMIN" ? true : false} />
                })
            }
            <input className="chat-input" value={text} onChange={e => handleChange(e)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    )
}

const Message = (props) => {
    let messageParagraph =  (props.isAdmin) ?  <p className="message-p isAdmin">{props.name}: {props.message}</p> :
    <p className="message-p">{props.name} : {props.message}</p>;
    return (
        <div className="message-box">
            {messageParagraph}
        </div>
    )
}