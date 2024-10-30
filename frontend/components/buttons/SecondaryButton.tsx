import { ReactNode } from "react"

export const SecondaryButton = ({ children, onClick, size = "small" }: {
    children: ReactNode,
    onClick: () => void,
    size?: "big" | "small"
}) => {
    return <div onClick={onClick} className={`${size === "small" ? "md:text-sm" : "md:text-xl"} ${size === "small" ? "px-4 md:px-8 pt-2" : "px-5 py-4 md:px-10 md:py-4"} cursor-pointer hover:shadow-md border text-black border-black rounded-full`}>
        {children}
    </div>
}