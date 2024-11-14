import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { editNode } from "@/store/slices/zapSlice";



export default function EmailComp() {

    const nodesStore = useSelector((state:RootState) => {
        return state.zapSlice
    });


    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [to, setTo] = useState("");
    const router = useRouter();
    const dispatch = useDispatch();
    const selectedNodeStore = useSelector((state: RootState) => state.selectedNode?.selectedNode);
    const params = useParams();
    const nodeStore = useSelector((state: RootState) => state.zapSlice.nodes);


    const zapId = params.id

    function eleminateBraces(str: string){
        const match = str.match(/\{\s*(.*?)\s*\}/);
        return match ? match[1].trim() : str.trim();
    }

    useEffect(() => {

        if(!selectedNodeStore) return;
        if (selectedNodeStore?.id) {// @ts-expect-error: This can throw error
            const node = nodeStore.find(node => node.id === Number(selectedNodeStore.id));
            if (node?.metadata) {// @ts-expect-error: This can throw error
                const newTo = eleminateBraces(node.metadata.to || "");// @ts-expect-error: This can throw error
                const newSubject = eleminateBraces(node.metadata.subject || ""); // @ts-expect-error: This can throw error
                const newBody = node.metadata.body || "";
            
                setTo(newTo);
                setSubject(newSubject);
                setBody(newBody);

                // Log to check values
                console.log("Set values from node metadata:", newTo, newSubject, newBody);
            }
        }
    }, [selectedNodeStore, nodeStore]);
    
    console.log("this is the zap id :" +zapId);

    const validateFields = () => {
        if (!to || !subject || !body) {
            toast.error("Please fill all * the details!!");
            return false;
        }
        return true;
    };

    // Save state to store only
    const handlerState = () => {
        if (!validateFields()) return;

        const updatedDetails = {
            body,
            to: `{ ${to} }`,
            subject: `{${subject}}`
        };

        if (selectedNodeStore?.id) {
            dispatch(editNode({
                id: Number(selectedNodeStore.id),
                item: selectedNodeStore.actionType,
                updatedDetails,
            }));
            toast.success("Zap saved!");
        }

        console.log("this is the nodermon "+JSON.stringify(nodesStore))
    };

    const handler = async () => {
        if (to === '' || subject === '' || body === '') {
            toast.error("Please fill all * the details!!");
            return;
        }
    
        const updatedDetails = {
            body,
            to: `{ ${to} }`,
            subject: `{${subject}}`
        };
    
        // Dispatch the node update
        if (selectedNodeStore?.id) {
            dispatch(editNode({
                id: Number(selectedNodeStore.id),
                item: selectedNodeStore.actionType,
                updatedDetails
            }));
        }
    

        const actions = nodesStore.nodes 
            .filter((node) => node.type.id === "email") 
            .map((node) => {

                return {
                    availableActionId: "email",
                    actionMetadata: node.metadata
                }
            })
    
        console.log("These are the actions:", JSON.stringify(actions, null, 2));
    
        // Make the API request to update the zap with unique actions
        try {
            await axios.put(`${BACKEND_URL}/api/v1/zap/${zapId}`, {
                availableTriggerId: "webhook",
                triggerMetadata: {},
                actions
            }, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    userId: localStorage.getItem("userId")
                }
            });
    
            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating zap:", error);
            toast.error("Failed to publish zap!");
        }
    };
    

    return (
        <div className="w-96 object-fit flex flex-col gap-4">

            <div>
            <Label>To <span className="text-red-700">*</span></Label>
            <Input type="text"  placeholder="comment.to" value={to} onChange={e => setTo(e.target.value)} />
            </div>


            <div>
            <Label>Subject <span className="text-red-700">*</span></Label>
            <Input type="text"  placeholder="comment.subject" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            <div>
            <Label>Body <span className="text-red-700">*</span></Label>
            <Textarea  placeholder="this is the body with {comment.amount} dynamic value" value={body} onChange={e => setBody(e.target.value)} />
            </div>

            <div className="flex justify-between">
                <Button onClick={handlerState}>Save Zap</Button>
                <Button onClick={handler}>Publish Zap</Button>
            </div>
                
        </div>
    );
}