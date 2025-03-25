import { useState, useEffect } from "react";
import "./App.css"
import Dashboard from "./components/Dashboard";

function App() {
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const[currentDirectory, setCurrentDirectory] = useState("");

    const[server, setServer] = useState("");
    const [config, setConfig] = useState([]);
    
    // fetch server data and check authentication on component mount
    useEffect(() => {
        fetchConfig();
    }, []);
    
    async function fetchConfig() {
        const reponse = await fetch('/config.json');
        const configData = await reponse.json();
        setServer(`http://${configData.ip}:${configData.port}`);
        setCurrentDirectory(configData.home);
        setConfig(configData);

        checkAuth(configData);
    }

    async function checkAuth(configData) {
        const url = `http://${configData.ip}:${configData.port}/files`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ directory: configData.home }),
            credentials: "include"
        });

        setIsLoggedIn(response.ok);
        console.log("status: ", response.status);
        console.log("authorized: ", response.ok);
    }

    useEffect(() => {
        console.log("Login state updated:", isLoggedIn);
    }, [isLoggedIn]);  // This will log every time `isLoggedIn` changes

    async function handleLogin(e) {
        e.preventDefault();

        const response = await fetch(`${server}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({password}),
        });

        if (response.ok) {
            setIsLoggedIn(true);
        } else {
            alert("Incorrect Password");
        }
    }

    return (
        <div>
            {isLoggedIn && (
                <Dashboard server={server} currentDirectory={currentDirectory} setCurrentDirectory={setCurrentDirectory} config={config} setIsLoggedIn={setIsLoggedIn}/>
            )}

            {!isLoggedIn && (
                <form onSubmit={handleLogin}>
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required></input>
                    <button type="submit">Login</button>
                </form>
            )}
        </div>
    )
}

export default App
