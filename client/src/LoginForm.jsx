import { useState } from "react";
import { Button, Input, TextField, Label } from "@heroui/react";

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
            <div>
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
                <Button className="bg-orange text-ink font-semibold"
                onPress={handleSubmit}>
                    Sign In
                </Button>
        </div>
    </div>
</div>
);
}

export default LoginForm;
     