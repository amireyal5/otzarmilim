import React, { useState } from 'react';
import { PaymentsDashboard } from './PaymentsDashboard.tsx';
import { AdminImportPage } from './AdminImportPage.tsx';
import type { User, Payment } from '../types/index.ts';

interface DashboardPageProps {
    user: User;
    onLogout: () => void;
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

type View = 'dashboard' | 'import';

export const DashboardPage = ({ user, onLogout, payments, setPayments }: DashboardPageProps) => {
    const [activeView, setActiveView] = useState<View>('dashboard');

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2 className="header-title">מערכת ניהול</h2>
                <div className="user-info">
                    <span>שלום, {user.name}</span>
                    <button onClick={onLogout} className="logout-button">התנתקות</button>
                </div>
            </header>
            <div className="dashboard-body">
                <nav className="dashboard-nav">
                    <ul>
                        {user.role === 'admin' && (
                            <>
                                <li className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
                                    ניהול מטופלים
                                </li>
                                <li className={activeView === 'import' ? 'active' : ''} onClick={() => setActiveView('import')}>
                                    ייבוא נתונים
                                </li>
                            </>
                        )}
                        {user.role === 'therapist' && (
                            <li className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
                                המטופלים שלי
                            </li>
                        )}
                    </ul>
                </nav>
                <main>
                    {activeView === 'dashboard' && (
                        <PaymentsDashboard 
                            user={user} 
                            payments={payments}
                            setPayments={setPayments} 
                        />
                    )}
                    {activeView === 'import' && user.role === 'admin' && (
                        <AdminImportPage 
                            onImportSuccess={(newPayments) => setPayments(prev => [...prev, ...newPayments])}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};