import { useState , useEffect, useRef } from "react";
import { Button, Input, TextField, Label } from "@heroui/react";
import {Link, useSearchParams} from "react-router-dom";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function LoginForm() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [searchParams] = useSearchParams();

    const hasExchanged = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code && !hasExchanged.current) {
            hasExchanged.current = true;
            
            fetch(import.meta.env.VITE_API_URL + "/api/auth/exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
            });
        }
    }, []);

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
                {/* left panel empty for now */}
        </div>
        <div className="flex-1 bg-champagne flex items-center justify-center">
            
            <div className="flex flex-col gap-4">
                

                <div className="flex flex-col gap-2 ">
                    <a href={import.meta.env.VITE_API_URL + "/api/auth/google"} className="flex items-center justify-center gap-2 border border-gray-light py-2 rounded-lg hover:bg-gray-light transition-colors">
                        <FcGoogle size={20} />
                        <span className="font-medium">Continue with Google</span>
                    </a>
                    <a href={import.meta.env.VITE_API_URL + "/api/auth/github"} className="flex items-center justify-center gap-2 border border-gray-light py-2 rounded-lg hover:bg-gray-light transition-colors">
                        <FaGithub size={20} />
                        <span className="font-medium">Continue with GitHub</span>
                    </a>
                </div>

                <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-px bg-gray-light" />
                    <span className="text-sm text-navy">or</span>
                    <div className="flex-1 h-px bg-gray-light" />
                </div>

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
     