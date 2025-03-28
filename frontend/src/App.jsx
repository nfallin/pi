import { useState, useEffect } from "react";
import "./App.css"
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";

// global rate limiting on API calls / timeout bans on login attempts
// more robust account system for multiple users and associated parent directories
// toggleable IP whitelist
// encrypt passwords before sending back and forth and storing

function App() {
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const[currentDirectory, setCurrentDirectory] = useState("");

    const[server, setServer] = useState("");
    const [config, setConfig] = useState([]);
    
    // fetch server data and check authentication on component mount
    useEffect(() => {
        fetchConfig();
    }, []);
    
    async function fetchConfig() {
        const response = await fetch('/config.json');
        const configData = await response.json();
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
    }

    return (
        <div>
            {isLoggedIn && (
                <Dashboard server={server} currentDirectory={currentDirectory} setCurrentDirectory={setCurrentDirectory} config={config} setIsLoggedIn={setIsLoggedIn}/>
            )}

            {!isLoggedIn && (
                <LoginForm server={server} setIsLoggedIn={setIsLoggedIn}></LoginForm>
            )}
        </div>
    )
}

export default App
