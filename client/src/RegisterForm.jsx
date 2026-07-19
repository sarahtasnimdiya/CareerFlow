import { useState, useEffect, useRef } from "react";
import { Button, Input, TextField, Label } from "@heroui/react";
import {Link, useSearchParams, useNavigate} from "react-router-dom";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function RegisterForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
                    saveNameAndNavigate(data.token, firstName, lastName, navigate)
                    .then(() => navigate("/"));
                }
            });
        }
    }, []);

    async function handleSubmit(event) {
        setErrorMessage("");
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        const response = await fetch(import.meta.env.VITE_API_URL + "/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        console.log("Form submitted:", data);
        if (data.token) {
            saveNameAndNavigate(data.token, firstName, lastName, navigate)
            .then(() => navigate("/"));
        }

    }

    function saveNameAndNavigate(token, firstName, lastName, navigate) {
        localStorage.setItem("token", token);

        return fetch(import.meta.env.VITE_API_URL + "/api/attributes", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(attributes => {
            const firstNameAttr = attributes.find(a => a.name === 'First Name');
            const lastNameAttr = attributes.find(a => a.name === 'Last Name');

            const saveField = (attr, value) => attr && value
            ? fetch(import.meta.env.VITE_API_URL + "/api/profile/values", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ attributeId: attr.id, value, version: 1 })
                })
            : Promise.resolve();

            return Promise.all([
            saveField(firstNameAttr, firstName),
            saveField(lastNameAttr, lastName)
            ]);
        });
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

                {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

                <div className="flex flex-col gap-2">
                    <TextField>
                        <Label>Username</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </TextField>
                    <div className="grid grid-cols-2 gap-2">
                        <TextField>
                            <Label>First Name</Label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </TextField>
                        <TextField>
                            <Label>Last Name</Label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </TextField>
                    </div>
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
                    <TextField>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
     