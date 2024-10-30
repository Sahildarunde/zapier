import { ReactNode } from "react"

export const PrimaryButton = ({ children, onClick, size = "small" }: {
    children: ReactNode,
    onClick: () => void,
    size?: "big" | "small"
}) => {
    return <div onClick={onClick} className={`${size === "small" ? "text-sm" : "md:text-xl"} ${size === "small" ? "px-4 py-4 md:px-8 md:py-2" : "px-4 py-4 md:px-10 md:py-4"} cursor-pointer hover:shadow-md bg-amber-700 text-white rounded-full text-center flex justify-center flex-col`}>
        {children}
    </div>
}