
'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { initialMockPayments } from '@/lib/data';
import type { User, Payment } from '@/lib/types';

interface AppContextType {
    loggedInUser: User | null;
    setLoggedInUser: (user: User | null) => void;
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

export const AppContext = createContext<AppContextType>({
    loggedInUser: null,
    setLoggedInUser: () => {},
    payments: [],
    setPayments: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [payments, setPayments] = useState<Payment[]>(initialMockPayments);

    return (
        <AppContext.Provider value={{ loggedInUser, setLoggedInUser, payments, setPayments }}>
            {children}
        </AppContext.Provider>
    );
};
