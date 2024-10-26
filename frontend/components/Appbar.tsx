"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";

const Appbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

   
    useEffect(() => {
        const token = localStorage.getItem("token"); 
        setIsLoggedIn(!!token); 
    }, []);

    const handleLogout = () => {
        
        localStorage.removeItem("token"); 
        setIsLoggedIn(false); 
        router.push("/login");
    };

    return (
        <div className="flex border-b justify-between p-4">
            <div
                onClick={() => {
                    router.push("/dashboard");
                }}
                className="flex flex-col justify-center text-2xl font-extrabold"
            >
                zapier
            </div>
            <div className="flex">
                <div className="pr-4">
                    <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
                </div>
                
                {isLoggedIn ? (
                    <PrimaryButton onClick={handleLogout}>
                        Logout
                    </PrimaryButton>
                ) : (
                    <>
                        <div className="pr-4">
                            <LinkButton onClick={() => router.push("/login")}>Login</LinkButton>
                        </div>
                        <PrimaryButton
                            onClick={() => {
                                router.push("/signup");
                            }}
                        >
                            Signup
                        </PrimaryButton>
                    </>
                )}
            </div>
        </div>
    );
};

export default Appbar;



















