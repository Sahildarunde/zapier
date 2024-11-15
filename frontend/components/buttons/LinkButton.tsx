"use client";

import { RootState } from "@/store";
import { ReactNode } from "react"
import { useSelector } from "react-redux";

export const LinkButton = ({ children, onClick }: { children: ReactNode, onClick: () => void }) => {

    const theme = useSelector((state: RootState) => state.theme.theme);
    return <div className={`flex justify-center px-2 py-2 cursor-pointer ${theme === 'light' ?  "hover:bg-slate-100" : 'hover:bg-slate-400'} font-light text-sm rounded`} onClick={onClick}>
        {children}
    </div>
}