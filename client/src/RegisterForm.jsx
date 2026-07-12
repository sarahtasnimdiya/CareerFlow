import { useState } from "react";
import { Button, Input, TextField, Label } from "@heroui/react";
import {Link} from "react-router-dom";

function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event) {
        const response = await fetch(import.meta.env.VITE_API_URL + "/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        console.log("Form submitted:", data);
    }

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 bg-ink">
                {/* left panel — empty for now */}
        </div>
        <div className="flex-1 bg-champagne flex items-center justify-center">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <TextField>
                        <Label>Username</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </TextField>
                    <TextField>
                        <Label>Email</Label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </TextField>
                    <TextField>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </TextField>
                </div>
                <Button className="bg-orange text-ink font-semibold"
                onPress={handleSubmit}>
                    Sign Up
                </Button>

                <p className="mt-4 text-center">
                    Already have an account? 
                    <Link to="/login" className="text-orange font-semibold ml-1">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    </div>
);
}
    
export default RegisterForm;
     