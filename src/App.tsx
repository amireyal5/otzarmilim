import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage.tsx';
import { DashboardPage } from './components/DashboardPage.tsx';
import type { User, Payment } from './types/index.ts';
import { initialMockPayments } from './data/index.ts';

export const App = () => {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [payments, setPayments] = useState<Payment[]>(initialMockPayments);

    const handleLoginSuccess = (user: User) => {
        setLoggedInUser(user);
    };

    const handleLogout = () => {
        setLoggedInUser(null);
    };

    if (!loggedInUser) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <DashboardPage 
            user={loggedInUser} 
            onLogout={handleLogout} 
            payments={payments}
            setPayments={setPayments}
        />
    );
};