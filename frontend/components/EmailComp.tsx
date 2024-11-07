import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useEffect, useMemo, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { editNode } from "@/store/slices/zapSlice";


type Metadata = Record<string, string | number>;


function flattenObject(obj: Record<string, any>, parentKey = ""): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
            Object.assign(acc, flattenObject(obj[key], newKey));
        } else {
            // @ts-ignore
            acc[newKey] = obj[key];
        }
        return acc;
    }, {});
}

function useAvailableActionsAndTriggers() {
    const [availableActions, setAvailableActions] = useState([]);
    const [availableTriggers, setAvailableTriggers] = useState([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
            .then(x => setAvailableTriggers(x.data.availableTriggers))

        axios.get(`${BACKEND_URL}/api/v1/action/available`)
            .then(x => setAvailableActions(x.data.availableActions))
    }, [])

    // @ts-ignore
    console.log(availableTriggers)

    return {
        availableActions,
        availableTriggers
    }
}

export default function EmailComp() {

    const recordSelector = useSelector((state: RootState) => state.RecordState?.RecordState);

    const nodesStore = useSelector((state:RootState) => {
        return state.zapSlice
    });

    const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
    const [selectedTrigger, setSelectedTrigger] = useState<{
        id: string;
        name: string;
    }>();

    const [selectedActions, setSelectedActions] = useState<{
        index: number;
        availableActionId: string;
        availableActionName: string;
        metadata: Metadata;
    }[]>([]);

    const flattenedData = useMemo(() => flattenObject(recordSelector || {}), [recordSelector]);
    
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [to, setTo] = useState("");
    const [from, setFrom] = useState("");
    const router = useRouter();
    const dispatch = useDispatch();
    const selectedNodeStore = useSelector((state: RootState) => state.selectedNode?.selectedNode);

    const handler = async () => {

        
        


        // if(from === '' || to === '' || subject === '' || body === ''){
        //     toast.error("Please fill all * the details!!")
        //     return;
        // }

        

        

        

        const node = nodesStore.nodes.filter((a: { id: string }) => a.id === selectedNodeStore?.id)

        const updatedDetails = {
            body: body,
            to: `{ ${to} }`,
            from: from,
            subject: subject
        }

        dispatch(editNode({
            id: node[0].id,
            item: node[0].actionType,
            updatedDetails: updatedDetails
        }))

        const actions = nodesStore.nodes
            .filter((a: {type: string}) => a.type === "action")
            .map((a: {details : {}}) => ({
                availableActionId: 'email',
                actionMetadata: a.details,
            })
        )
        console.log(actions);

        

        await axios.post(`${BACKEND_URL}/api/v1/zap`, {
            // @ts-ignore
            "availableTriggerId": "webhook",
            "triggerMetadata": {},
            "actions": actions
        }, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
        
        router.push("/dashboard");
    
    }

    useEffect(() => {
        Object.entries(flattenedData).forEach(([key, value]) => {
            if(key.includes("email")){
                setTo(key);
                console.log(typeof(`{ ${key} }`))
            }
        })
    },[])
    return (
        <div className="w-96 object-fit flex flex-col gap-4">
            <div>
            <Label>From <span className="text-red-700">*</span></Label>
            <Input type="text"  placeholder="abc@xyz.com" value={from} onChange={e => setFrom(e.target.value)} />
            </div>

            {Object.entries(flattenedData).map(([key, value]) => (
                <div key={key} className="">
                    <Label htmlFor={key}>{key.includes("email") ? <span>To <span className="text-red-700">*</span> -{key}</span> : key}</Label>
                    <Input type="text" id={key} placeholder={key} defaultValue={`${value}`} />
                </div>
            ))}

            <div>
            <Label>Subject <span className="text-red-700">*</span></Label>
            <Input type="text"  placeholder="subject" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            <div>
            <Label>Body <span className="text-red-700">*</span></Label>
            <Textarea  placeholder="body" value={body} onChange={e => setBody(e.target.value)} />
            </div>

            <div>
                <Button onClick={handler}>Save Zap</Button>
            </div>
        </div>
    );
}


