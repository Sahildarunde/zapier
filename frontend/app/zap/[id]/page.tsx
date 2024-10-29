"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import Appbar from '@/components/Appbar';
import { BACKEND_URL } from '../../config';
import { useParams } from 'next/navigation'; // Import useParams from next/navigation
import Loader from '@/components/Loader';

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
    <div>
      <Appbar />
      {loading ? <div className='mt-10'><Loader /></div> : <ZapDisplay data={data}/>}
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
      {data.zap.id}
    </div>
  )
}