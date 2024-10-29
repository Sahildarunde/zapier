"use client";
import Appbar from "@/components/Appbar";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true); 
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
                username: email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            toast.success(" logging In...", );

            setTimeout(() => {router.push("/dashboard");}, 300)
        } catch (error) {
            toast.error("Incorrect credientials");
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div>
            <Appbar />
            <ToastContainer position="top-center" autoClose={3000} /> 
            <div className="flex justify-center">
                <div className="flex flex-col md:flex-row pt-8 max-w-4xl w-full"> {/* Use flex-col for smaller screens */}
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
                            onChange={e => {
                                setEmail(e.target.value);
                            }}
                            label={"Email"}
                            type="text"
                            placeholder="Your Email"
                        />
                        <Input
                            onChange={e => {
                                setPassword(e.target.value);
                            }}
                            label={"Password"}
                            type="password"
                            placeholder="Password"
                        />
                        <div className="pt-4">
                            {loading ? ( 
                                <Loader />
                            ) : (
                                <PrimaryButton
                                    onClick={handleLogin}
                                    size="big"
                                >
                                    Login
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}





















// "use client";
// import Appbar from "@/components/Appbar";
// import { CheckFeature } from "@/components/CheckFeature";
// import { Input } from "@/components/Input";
// import { PrimaryButton } from "@/components/buttons/PrimaryButton";
// import axios from "axios";
// import { useState } from "react";
// import { BACKEND_URL } from "../config";
// import { useRouter } from "next/navigation";

// export default function Page() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const router = useRouter();

//     return (
//         <div>
//             <Appbar />
//             <div className="flex justify-center">
//                 <div className="flex flex-col md:flex-row pt-8 max-w-4xl w-full"> {/* Use flex-col for smaller screens */}
//                     <div className="flex-1 pt-20 px-4">
//                         <div className="font-semibold text-3xl pb-4">
//                             Join millions worldwide who automate their work using Zapier.
//                         </div>
//                         <div className="pb-6 pt-4">
//                             <CheckFeature label={"Easy setup, no coding required"} />
//                         </div>
//                         <div className="pb-6">
//                             <CheckFeature label={"Free forever for core features"} />
//                         </div>
//                         <CheckFeature label={"14-day trial of premium features & apps"} />
//                     </div>
//                     <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
//                         <Input
//                             onChange={e => {
//                                 setEmail(e.target.value);
//                             }}
//                             label={"Email"}
//                             type="text"
//                             placeholder="Your Email"
//                         />
//                         <Input
//                             onChange={e => {
//                                 setPassword(e.target.value);
//                             }}
//                             label={"Password"}
//                             type="password"
//                             placeholder="Password"
//                         />
//                         <div className="pt-4">
//                             <PrimaryButton
//                                 onClick={async () => {
//                                     const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
//                                         username: email,
//                                         password,
//                                     });
//                                     localStorage.setItem("token", res.data.token);
//                                     router.push("/dashboard");
//                                 }}
//                                 size="big"
//                             >
//                                 Login
//                             </PrimaryButton>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }






