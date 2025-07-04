"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ConfirmationContextType = {
    code: string | null;
    setCode: (code: string | null) => void;
};

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(
    undefined
);

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context)
        throw new Error(
            "useConfirmation must be used within ConfirmationProvider"
        );
    return context;
};

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
    const [code, setCode] = useState<string | null>(null);
    return (
        <ConfirmationContext.Provider value={{ code, setCode }}>
            {children}
        </ConfirmationContext.Provider>
    );
};
