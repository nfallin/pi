import { useState, useEffect } from "react";
import "./style.css"



export default function LoginForm({server, setIsLoggedIn}) {

    const [password, setPassword] = useState("");

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
        <form onSubmit={handleLogin}>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required></input>
            <button type="submit">Login</button>
        </form>
    )
}
