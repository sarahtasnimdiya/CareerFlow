import { useState } from "react";
import { Button, Input, TextField, Label } from "@heroui/react";
import {Link} from "react-router-dom";

function LoginForm() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event) {
        const response = await fetch(import.meta.env.VITE_API_URL + "/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        console.log("Form submitted:", data);

         if (data.token) 
            {
            localStorage.setItem("token", data.token);
        }
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
                        <Label>Email or Username</Label>
                        <Input
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                    Sign In
                </Button>

                <p className="mt-4 text-center">
                    Don't have an account?
                    <Link to="/register" className="text-orange font-semibold ml-1">
                        Sign Up
                    </Link>
                </p>
        </div>
    </div>
</div>
);
}

export default LoginForm;
     