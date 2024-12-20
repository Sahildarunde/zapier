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
import { Id, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    let toastId: Id;
    let timeoutId: ReturnType<typeof setTimeout>

    const handleLogin = async () => {
        setLoading(true); 
        let timeoutActive = true
        try {
            const signinPromise = axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
                username: email,
                password,
            });

            timeoutId = setTimeout(() => {
                if(timeoutActive){
                    toastId = toast.loading("Server is hosted on free render instance so, it'll take some time to spin up!!", );
                }
            }, 500);


            
            const res = await signinPromise;

            timeoutActive = false
            clearTimeout(timeoutId);
            toast.update(toastId, { render: "Login successful!", type: "success", isLoading: false });
            


            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);


            setTimeout(() => toast.dismiss(toastId), 1000)
            setTimeout(() => {router.push("/dashboard");}, 300)
            
        } catch (e) {
            timeoutActive= false
            toast.update(toastId, { render: "Incorrect credentials!", type: "error", isLoading: false });
            clearTimeout(timeoutId);
            setTimeout(() => toast.dismiss(toastId), 1000)
            console.log(e);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div>
            <Appbar />
            <ToastContainer position="top-center" closeButton autoClose={3000} /> 
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