'use client'

import React, { useEffect, useState } from "react";
import { socket } from "../../socket";

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
            setMessages([...messages, message]);
        })
        
        return () => {
            socket.off("connect");
            //socket.off("userJoined");
        };


    }, [text, messages]);

    const handleChange = (e) => {
        setText(e.target.value);
    }

    const sendMessage = () => {
        const newMessage = { username: username, message: text };
        setMessages([...messages, newMessage]);
        socket.emit("sendMessage", newMessage, roomId);
    }


    return (
        <div className="chat-bar" >
            {
                <h1>{`Hello: ${props.username}`}</h1>
            }
            <h2>{`Room  ID: ${props.roomId}`}</h2>
            {
                messages.map(message => {
                    return <Message name={message.username} message={message.message}  />
                })
            }
            <input className="chat-input" value={text} onChange={e => handleChange(e)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    )
}

const Message = (props) => {

    return (
        <div className="mesasdsage">
            <p className="aaa">{props.name}: {props.message}</p>
        </div>
    )
}