"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import Loader from "./Loader";
import {  useSelector } from "react-redux";
import { RootState} from "@/store";
import { useDispatch } from "react-redux";
import { toggleTheme } from "@/store/slices/themeSlice";

const Appbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [isLoggedOut, setIsLoggedOut] = useState(false); 
    const theme = useSelector((state: RootState) => state.theme.theme);
    const dispatch = useDispatch();

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
            <div className="flex flex-col md:flex-row mt-4 md:mt-0 items-center gap-5">
                <div className="pr-4" onClick={() => dispatch(toggleTheme())}>
                    {theme === 'light' ? <DarkIcon />: <LightIcon/>}
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


function LightIcon(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>

    )
}


function DarkIcon(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
    )
}
