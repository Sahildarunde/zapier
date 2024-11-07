"use client";
import Appbar from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { LinkButton } from "@/components/buttons/LinkButton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/Loader";
import { headers } from "next/headers";

interface Zap {
    id: string;
    triggerId: string;
    userId: number;
    actions: {
        id: string;
        zapId: string;
        actionId: string;
        sortingOrder: number;
        type: {
            id: string;
            name: string;
            image: string;
        };
    }[];
    trigger: {
        id: string;
        zapId: string;
        triggerId: string;
        type: {
            id: string;
            name: string;
            image: string;
        };
    };
}

function useZaps() {
    const [loading, setLoading] = useState(true);
    const [zaps, setZaps] = useState<Zap[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/zap`, {
            headers: {
                "Authorization": localStorage.getItem("token"),
            },
        })
            .then(res => {
                setZaps(res.data.zaps);
                setLoading(false);
            });
    }, []);

    return { loading, zaps };
}

export default function Page() {
    const { loading, zaps } = useZaps();
    const router = useRouter();
    const [createLoading, setCreateLoading] = useState(false);

    async function handler(){
        setCreateLoading(true);

        try {
            const res = await axios.post(
                `${BACKEND_URL}/api/v1/zap/createEmptyZap`,
                {
                    userId: zaps[0].userId, 
                },
                {
                    headers: {
                        "Authorization": localStorage.getItem("token"),
                    },
                }
            );
            if (res.status === 201) {
                const zapId = res.data.id;
                if (zapId) {
                    router.push(`/zap/${zapId}`);
                } else {
                    console.error('Zap ID not returned from API');
                }
            }
        } catch (error) {
            console.error('Error creating zap:', error);
        }
    }

    return (
        <div>
            <Appbar />
            <div className="flex justify-center pt-8">
                <div className="max-w-screen-lg w-full">
                    <div className="flex justify-between pr-8 pl-8">
                        <div className="text-2xl font-bold ">My Zaps</div>
                        {createLoading ? <Loader /> : <DarkButton onClick={handler}>Create</DarkButton>}
                    </div>
                </div>
            </div>
            {loading ? (
              <div className="mt-[50px]">
                 <Loader />
              </div>
            ) : (
                <div className="flex justify-center pt-4">
                    <ZapTable zaps={zaps} />
                </div>
            )}
        </div>
    );
}
function ZapTable({ zaps }: { zaps: Zap[] }) {
    const router = useRouter();

    return (
        <div className="p-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-5 text-center font-semibold border-b">
                <div>Name</div>
                <div>ID</div>
                <div>Created at</div>
                <div>Webhook URL</div>
                <div>Go</div>
            </div>
            {zaps.map(z => (
                <div key={z.id} className="flex items-start border-b py-4 mt-2"> {/* Changed to items-start for better alignment */}
                    <div className="flex items-center flex-1 flex-wrap overflow-hidden"> {/* Added overflow-hidden to prevent overflow */}
                        {/* Check if z.trigger is valid and then access its image */}
                        {z.trigger && z.trigger.type && z.trigger.type.image && (
                            <Image src={z.trigger.type.image} width={30} height={30} className="mr-2" alt="" />
                        )}
                        <span className="mr-2 mb-2"></span>
                        {/* Check each action for the image */}
                        {z.actions.map(x => (
                            x.type && x.type.image && (
                                <Image key={x.id} src={x.type.image} width={30} height={30} className="mr-2 mt-2" alt="" />
                            )
                        ))}
                    </div>
                    <div className="flex-1 text-center overflow-hidden text-ellipsis">{z.id}</div> {/* Added overflow-hidden and text-ellipsis */}
                    <div className="flex-1 text-center overflow-hidden text-ellipsis">Nov 13, 2023</div> {/* Added overflow-hidden and text-ellipsis */}
                    <div className="flex-1 text-center overflow-hidden text-ellipsis">{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</div> {/* Added overflow-hidden and text-ellipsis */}
                    <div className="flex-1 text-center">
                        <LinkButton onClick={() => router.push("/zap/" + z.id)}>Go</LinkButton>
                    </div>
                </div>
            ))}
        </div>
    );
}



