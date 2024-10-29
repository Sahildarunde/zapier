"use client";
import Appbar from "@/components/Appbar";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";
import Loader from "@/components/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Page() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handler = async () => {
        setIsLoading(true);

        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
                username: email,
                password,
                name,
            });
            toast.success("Signup successful! Redirecting to login...", );
            
            setTimeout(() => {router.push("/login");}, 300)
        } catch (error) {
            toast.error("Incorrect credientials");
        }finally{
            setIsLoading(false)
        }
        
    }



    return (
        <div>
            <Appbar />
            <ToastContainer position="top-center" autoClose={3000} /> 
            <div className="flex justify-center">
                <div className="flex flex-col md:flex-row pt-8 max-w-4xl w-full"> {/* Use flex-col for small screens */}
                    <div className="flex-1 pt-20 px-4">
                        <div className="font-semibold text-3xl pb-4">
                            Join millions worldwide who automate their work using Zapier.
                        </div>
                        <div className="pb-6 pt-4">
                            <CheckFeature label={"Easy setup, no coding required"} />
                        </div>
                        <div className="pb-6">
                            <CheckFeature label={"Free forever for core features"} />
                        </div>
                        <CheckFeature label={"14-day trial of premium features & apps"} />
                    </div>
                    <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
                        <Input
                            label={"Name"}
                            onChange={e => setName(e.target.value)}
                            type="text"
                            placeholder="Your name"
                        />
                        <Input
                            label={"Email"}
                            onChange={e => setEmail(e.target.value)}
                            type="text"
                            placeholder="Your Email"
                        />
                        <Input
                            label={"Password"}
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                        />
                        <div className="pt-4">
                            {isLoading ? (
                                <Loader />
                               
                            ) : (
                                <PrimaryButton
                                onClick={handler}
                                size="big"
                            >
                                Signup
                            </PrimaryButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}







