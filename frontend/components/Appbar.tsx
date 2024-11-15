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

                <a href="https://github.com/Sahildarunde/zapier" target="_blank" rel="noopener noreferrer">
                    <div className={`pr-4 invert-on-dark ${theme === 'dark' ? "invert" : ""}`} >
                        <GithubIcon  />
                    </div>
                </a>

                <div className="pr-4 cursor-pointer" >
                <LinkButton onClick={() => router.push('/systemdesign')}>System Design</LinkButton>
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

function GithubIcon(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={30} viewBox="0 0 64 64">
            <path d="M32 6C17.641 6 6 17.641 6 32c0 12.277 8.512 22.56 19.955 25.286-.592-.141-1.179-.299-1.755-.479V50.85c0 0-.975.325-2.275.325-3.637 0-5.148-3.245-5.525-4.875-.229-.993-.827-1.934-1.469-2.509-.767-.684-1.126-.686-1.131-.92-.01-.491.658-.471.975-.471 1.625 0 2.857 1.729 3.429 2.623 1.417 2.207 2.938 2.577 3.721 2.577.975 0 1.817-.146 2.397-.426.268-1.888 1.108-3.57 2.478-4.774-6.097-1.219-10.4-4.716-10.4-10.4 0-2.928 1.175-5.619 3.133-7.792C19.333 23.641 19 22.494 19 20.625c0-1.235.086-2.751.65-4.225 0 0 3.708.026 7.205 3.338C28.469 19.268 30.196 19 32 19s3.531.268 5.145.738c3.497-3.312 7.205-3.338 7.205-3.338.567 1.474.65 2.99.65 4.225 0 2.015-.268 3.19-.432 3.697C46.466 26.475 47.6 29.124 47.6 32c0 5.684-4.303 9.181-10.4 10.4 1.628 1.43 2.6 3.513 2.6 5.85v8.557c-.576.181-1.162.338-1.755.479C49.488 54.56 58 44.277 58 32 58 17.641 46.359 6 32 6zM33.813 57.93C33.214 57.972 32.61 58 32 58 32.61 58 33.213 57.971 33.813 57.93zM37.786 57.346c-1.164.265-2.357.451-3.575.554C35.429 57.797 36.622 57.61 37.786 57.346zM32 58c-.61 0-1.214-.028-1.813-.07C30.787 57.971 31.39 58 32 58zM29.788 57.9c-1.217-.103-2.411-.289-3.574-.554C27.378 57.61 28.571 57.797 29.788 57.9z"></path>
        </svg>
    )
}
