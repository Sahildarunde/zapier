
import { useParams } from "next/navigation"
import { Card, CardDescription, CardTitle } from "./ui/card";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { useDispatch } from "react-redux";
import { setRecordNode } from "@/store/slices/recordSlice";
import { PrimaryButton } from "./buttons/PrimaryButton";
  



export default function WebhookComp(){

    const params = useParams();
    const [activeTab, setActiveTab] = useState("configure")
    const [triggerEvent, setTriggerEvent] = useState("")
    const [verified, setVerified] = useState(false);


    const urlString = `https://zapier-hooks-w0js.onrender.com/hooks/catch/1/${params.id}`

    return (
        <div className="w-96 object-fit "> 
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="configure" >Configure</TabsTrigger>
                    <ArrowIcon />
                    <TabsTrigger value="test">Test</TabsTrigger>
                    {verified ? <VerifiedIcon /> : <></>}
                </TabsList>
                <TabsContent value="configure"><Configure urlString={urlString} setActiveTab={setActiveTab} setTriggerEvent={setTriggerEvent} triggerEvent={triggerEvent}/></TabsContent>
                <TabsContent value="test"><Test urlString={urlString} setVerified={setVerified} /></TabsContent>
               
            </Tabs>
        </div>
    )
}

function VerifiedIcon(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
    )
}


function CopyIcon({urlString}: {urlString: string}){
    const handleCopy = () => {
        navigator.clipboard.writeText(urlString).then(() => {
            toast.success("Webhook url copied!!") 
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };
    return <svg xmlns="http://www.w3.org/2000/svg" onClick={handleCopy} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-slate-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
  
}

function Configure(
    {urlString, setActiveTab, setTriggerEvent, triggerEvent}: 
    {   urlString: string, 
        setActiveTab: React.Dispatch<React.SetStateAction<string>>, 
        setTriggerEvent: React.Dispatch<React.SetStateAction<string>>,
        triggerEvent: string
    }){




    return (
        <div>
            <Card className="w-full p-2 mt-12 text-sm text-slate-600 resize-none flex justify-center items-center" >
                <CardDescription>{urlString}</CardDescription >
                <Card className="p-1 cursor-pointer " ><CopyIcon urlString={urlString}/></Card>
            </Card>
            <div className="mt-8 gap-2 flex flex-col">
                <Label htmlFor="Trigger-event " >Trigger Event  <span className="text-red-700">*</span></Label>
                <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                    <SelectTrigger>
                        <SelectValue placeholder="Trigger event"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem onClick={() => setTriggerEvent("catch-hook")} value="catch-hook">CATCH HOOK</SelectItem>
                        {}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-center item-center mt-12">
                <PrimaryButton onClick={() =>triggerEvent==="" ? toast.error("enter trigger event") : setActiveTab("test")}>Continue</PrimaryButton>
            </div>
        </div>
    )
}

// @ts-expect-error: This can throw error
function Test({ urlString, setVerified }: { urlString: string, setVerified}) {
    const [loading, setLoading] = useState(false); // State to manage loading
    const [results, setResults] = useState([]);
    const params = useParams();

    const handleTestTrigger = async () => {
        setLoading(true); // Set loading to true when the button is pressed

        try {
            
            const res = await axios.get(`${BACKEND_URL}/api/v1/zap/getZapRuns`, { headers: {
                "Authorization": localStorage.getItem("token"),
            },params: {
                zapId: params.id
            }});
            setResults(res.data.zapRuns)
            setVerified(true);
            console.log(results)
            toast.success("Trigger tested successfully!"); 
        } catch (error) {
            console.error("Error testing trigger:", error);
            toast.error("Failed to test trigger."); // Show error toast
        } finally {
            setLoading(false); // Set loading to false when the request is done
        }
    };

    // @ts-expect-error: This can throw error
    const renderJson = (data, level: number = 0) => {
        if (typeof data === "object" && data !== null) {
            return (
                <ul style={{ paddingLeft: `${level * 15}px` }}>
                    {Object.entries(data).map(([key, value]) => (
                        <li key={key}>
                            {/* @ts-expect-error: This can throw error */}
                            <strong>{key}:</strong> {typeof value === "object" ? renderJson(value, level + 1) : value.toString()}
                        </li>
                    ))}
                </ul>
            );
        } else {
            return <span>{data}</span>;
        }
    };

    let rec = 1;

    const dispatch = useDispatch();


    return (
        <div>
            <Card className="w-full p-2 mt-12 text-sm text-slate-600 resize-none flex justify-center items-center">
                <CardDescription>{urlString}</CardDescription>
                <Card className="p-1 cursor-pointer"><CopyIcon urlString={urlString} /></Card>
            </Card>
            <CardTitle className="mt-8">We&apos;re listening!</CardTitle>
            <CardDescription className="mt-2">To confirm your trigger is set up correctly, we&apos;ll find recent requests in your account:</CardDescription>
            <CardDescription className="mt-5">Webhooks by Zapier</CardDescription>
            <Label className="mt-2 mb-2">Records: </Label>
            <Card>
            <div className="max-h-40 overflow-y-auto mt-2">
                {results.map((res, index) => (
                    <div key={index}>
                        <Card className="p-2 ml-4 w-1/2 mt-2 flex justify-between items-center">
                            <Popover>
                                <PopoverTrigger className="w-full font-bold">
                                    <span>Record {rec++}</span>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="p-4">
                                        <h4>Metadata Keys</h4>
                                        {(() => {
                                            try {
                                                // @ts-expect-error: This can throw error
                                                const metadata = typeof res.metadata === "string" ? JSON.parse(res.metadata) : res.metadata;
                                                const me =  renderJson(metadata);
                                                if(index === results.length-1){
                                                    dispatch(setRecordNode(metadata))
                                                }
                                                return me;
                                            } catch (error) {
                                                console.error("Invalid JSON:", error);
                                                return <div>Invalid metadata format</div>;
                                            }
                                        })()}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <DownArrow />
                        </Card>
                    </div>
                ))}
            </div>
            </Card>


            <div className="flex justify-center item-center mt-12">
                <PrimaryButton onClick={handleTestTrigger} >
                    {loading ? "fetching request..." : "Listen on Trigger"}
                </PrimaryButton>
            </div>

            
        </div>
    );
}


function ArrowIcon(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3 text-slate-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>

    )
}

function DownArrow(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3 text-slate-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>

    )
}