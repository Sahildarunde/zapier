"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Import useEffect
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";

const Appbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

    // Check for authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem("token"); // Check for the token in localStorage
        setIsLoggedIn(!!token); // Update the login state based on token presence
    }, []);

    const handleLogout = () => {
        // Clear user authentication data
        localStorage.removeItem("token"); // Remove the token from localStorage
        setIsLoggedIn(false); // Update login state
        router.push("/login"); // Redirect to login page
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
                {/* Conditional rendering based on login status */}
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





















// "use client";
// import { useRouter } from "next/navigation"
// import { LinkButton } from "./buttons/LinkButton"
// import { PrimaryButton } from "./buttons/PrimaryButton";

// const Appbar = () => {
//     const router = useRouter();
//     return <div className="flex border-b justify-between p-4">
//         <div onClick={() => {
//                     router.push("/dashboard")
//                 }} className="flex flex-col justify-center text-2xl font-extrabold">
//             zapier
//         </div>
//         <div className="flex">
//             <div className="pr-4">
//                 <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
//             </div>
//             <div className="pr-4">
//                 <LinkButton onClick={() => {
//                     router.push("/login")
//                 }}>Login</LinkButton>
//             </div>
//             <PrimaryButton onClick={() => {
//                 router.push("/signup")
//             }}>
//                 Signup
//             </PrimaryButton>            
//         </div>
//     </div>
// }

// export default Appbar;
