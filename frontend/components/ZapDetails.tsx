import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import WebhookComp from "./WebhookComp";
import EmailComp from "./EmailComp";
import SolComp from "./SolComp";


export default function ZapDetails(){
// @ts-expect-error: This can throw error
const nodeStore = useSelector(state => state.zapSlice.nodes)

const selectedNodeStore = useSelector((state: RootState) => state.selectedNode?.selectedNode);

if (!selectedNodeStore) {
return <div>No selected node available</div>;
}

// const actionType = nodeStore.find((n: { id: string }) => n.id === selectedNodeStore.id)?.type.name;
console.log("this is seectedjasdjad "+JSON.stringify(nodeStore[selectedNodeStore.id]))
let type = nodeStore[selectedNodeStore.id]?.actionType;
console.log("this is the typeriyata : "+type);
if(type === undefined){
  type = nodeStore[selectedNodeStore.id]?.type.id;
}

console.log("type.name : "+ type)
console.log("nodestore here : "+ JSON.stringify(nodeStore))
const actionComponent: { [key: string]: JSX.Element} = {
"Webhook": <WebhookComp />,
"Send Email": <EmailComp />,
"Send Solana": <SolComp />,
"webhook":  <WebhookComp />,
"email": <EmailComp />,
"sol": <SolComp />,
} 



return (
<div>
  <Card>
    <CardHeader>
      <CardTitle>{type} </CardTitle>
      <CardDescription>
       #0{selectedNodeStore.id}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {
        actionComponent[type]
      }
    </CardContent>

  </Card> 
</div>
);

}