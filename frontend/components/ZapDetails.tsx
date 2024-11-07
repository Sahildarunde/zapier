import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import WebhookComp from "./WebhookComp";
import EmailComp from "./EmailComp";
import SolComp from "./SolComp";

interface ZapData {
    zap: {
        id: string;
        
    };
}

export default function ZapDetails(){
  //  @ts-ignore
  const nodeStore = useSelector(state => state.zapSlice.nodes)
  //  @ts-ignore
  const selectedNodeStore = useSelector((state: RootState) => state.selectedNode?.selectedNode);

if (!selectedNodeStore) {
  return <div>No selected node available</div>;
}

const actionType = nodeStore.find((n: { id: string }) => n.id === selectedNodeStore.id)?.actionType;

const actionComponent: { [key: string]: JSX.Element} = {
  "Webhook": <WebhookComp />,
  "Send Email": <EmailComp />,
  "Send Solana": <SolComp />
} 



return (
  <div>
    <Card>
      <CardHeader>
        <CardTitle>{actionType} </CardTitle>
        <CardDescription>
         #0{selectedNodeStore.id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {
          actionComponent[actionType]
        }
      </CardContent>

    </Card> 
  </div>
);

}