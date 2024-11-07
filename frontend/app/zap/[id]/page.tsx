"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import Appbar from '@/components/Appbar';
import { BACKEND_URL } from '../../config';
import { useParams } from 'next/navigation'; // Import useParams from next/navigation
import Loader from '@/components/Loader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ZapDetails from '@/components/ZapDetails';



const Page = () => {
  const { id } = useParams(); // Use useParams to get the dynamic ID from the URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token"); // Get the token from localStorage
          const response = await axios.get(`${BACKEND_URL}/api/v1/zap/${id}`, {
            headers: {
              Authorization: token // Set the Authorization header
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


  return (
    <div className='h-screen w-full'>
      <Appbar />
      <div className='mt-10'>
        {loading ? <Loader /> : <ZapDisplay data={data}/>}
      </div>
    </div>
  );
};

export default Page;

interface ZapData {
  zap: {
    id: string;
    
  };
}

function ZapDisplay({data}: {data?:ZapData | null}){
  if (!data || !data.zap) {
    return <div>Data not available</div>;
  }

  return (
    <div>
     

      <div className='w-full md:pl-24 md:pr-24 object-fit gap-5 flex justify-center'>
        <div className=' w-1/3'>
          <ZapDetails data={data}/>
        </div>

        <div className='w-1/2 max-w-1/10 '>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              {data.zap.id}
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className='w-full  gap-5 mt-10 flex justify-center'>
          <div className='w-full lg:pr-56 lg:pl-56 pr-24 pl-24'>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              {data.zap.id}
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
          </div>
      </div>

    </div>
  )
}