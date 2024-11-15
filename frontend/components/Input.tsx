"use client";

import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const Input = ({
    label,
    placeholder,
    onChange,
    type = "text",
}: {
    label: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "password";
}) => {

    const theme = useSelector((state: RootState) => state.theme.theme);

    return (
        <div>
            <div className="text-sm pb-1 pt-2">
                * <label>{label}</label>
            </div>
            <input
                className={`border rounded px-4 py-2 w-full border-black ${theme === 'light' ? '': 'text-slate-600'}`}
                type={type}
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
};
