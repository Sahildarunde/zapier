"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import Loader from "./Loader";

const Appbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [isLoggedOut, setIsLoggedOut] = useState(false); 

    useEffect(() => {
        const token = localStorage.getItem("token"); 
        setIsLoggedIn(!!token); 
    }, []);

    const handleLogout = () => {
        setIsLoggedOut(true);
        localStorage.removeItem("token"); 
        setIsLoggedIn(false); 
        setTimeout(() => router.push("/"), 300);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between p-4 border-b">
            <div 
                onClick={() => {
                    if (isLoggedIn) {
                        router.push("/dashboard");
                    } else {
                        router.push("/");
                    }
                }}
                className="flex flex-col justify-center text-2xl font-extrabold cursor-pointer"
            >
                zapier
            </div>
            <div className="flex flex-col md:flex-row mt-4 md:mt-0">
                <div className="pr-4">
                    <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
                </div>
                
                {isLoggedIn ? (
                    isLoggedOut ? (
                        <Loader />
                    ) : (
                        <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
                    )
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




