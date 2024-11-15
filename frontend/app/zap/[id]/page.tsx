"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import Appbar from '@/components/Appbar';
import { BACKEND_URL } from '../../config';
import { useParams } from 'next/navigation'; 
import Loader from '@/components/Loader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ZapDetails from '@/components/ZapDetails';
import Flow from '@/components/Flow';
import { store } from '@/store';
import { Provider } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDispatch } from 'react-redux';
import { loadZap } from '@/store/slices/asyncThunk';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';




const Page = () => {
  const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  let urlString = `https://zapier-hooks-w0js.onrender.com/hooks/catch/1/${id}`
  const [jsonBody, setJsonBody] = useState('');
  const [buttonloading, setButtonLoading] = useState(false);

  


  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token"); 
          const response = await axios.get(`${BACKEND_URL}/api/v1/zap/${id}`, {
            headers: {
              Authorization: token 
            }
          });
          setData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleRequest = async() => {
    setButtonLoading(true)
    try {
      const parsedBody = JSON.parse(jsonBody);
      const res = await axios.post(urlString, parsedBody)

      if(res.data.message === 'Webhook received'){
        toast.success("Webhook request successfull!")
      }
    } catch (error) {
      toast.error("POST request failed! check json body")
      console.log(error);
    }finally{
      setButtonLoading(false)
    }

  }

  return (

    <Provider store={store}> 
    <ToastContainer position="top-center" closeButton autoClose={1500} /> 
    <div className='relative h-screen w-screen'>
      <Appbar />

      <Flow />

      <div className="absolute top-36 right-16 z-10 pointer-events-auto">
        {loading ? <Loader /> : <ZapDisplay data={data}/>}
      </div>
      
      <div className="fixed bottom-16 left-24 w-[50%]  z-20 pointer-events-auto">
        <div >
          <Card>
            <CardHeader>
              <CardTitle>Postman</CardTitle>
              <CardDescription>Make a webhook request with a JSON body</CardDescription>
            </CardHeader>

            <CardContent>
              <div className='flex justify-center items-center'>
                <div>
                  <Select value='POST'>
                    <SelectTrigger className="w-24 text-yellow-600 font-bold">
                      <SelectValue>POST</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='POST'>POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  <Input value={urlString} onChange={(e) => urlString=e.target.value}  placeholder="hooks-weblink" />
                  <PrimaryButton onClick={handleRequest}>{buttonloading ? "...wait" : "send"}</PrimaryButton>
              </div>
            </CardContent>
            <CardContent className=' min-h-24'>
              <div className=' h-full'>
              <div className="grid gap-1.5">
                <Label >JSON Body</Label>
                <Textarea placeholder={ " {'comment' : { 'to': 'abc@xyz.com','subject': 'This is Automated Zap ','amount': 0.5 }}" } onChange={(e) => setJsonBody(e.target.value)}/>
              </div>
              </div>
            </CardContent>
            
          </Card>
        </div>
      </div>
    </div>
    </Provider>
  );
};

export default Page;

interface ZapData {
  zap: {
    id: string;
  };
}

function ZapDisplay({ data }: { data?: ZapData | null }) {

  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      // @ts-expect-error: this can go wrong
      dispatch(loadZap(id)); // Pass the id to loadZap
    }
  }, [dispatch, id]);

  

  if (!data || !data.zap) {
    return <div>Data not available</div>;
  }

  return (
    <div className="flex flex-col h-screen z-30 pointer-events-auto">
      <ZapDetails />
    </div>
  );
}