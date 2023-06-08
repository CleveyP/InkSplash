
import './App.css';
import {socket} from "./socket";
import { Login } from './components/login/Login';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {ChatBar} from "./components/chatbar/ChatBar";

function App() {
 
  socket.on("connect", () => {console.log("you are connected!");

});

  return (
    <div className="App">
     <h1>InkSplash</h1>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/game" element={<ChatBar />}/>
     </Routes>
     </BrowserRouter>
    </div>
  );
}

export default App;
