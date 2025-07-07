
'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import PaymentsDashboard from './PaymentsDashboard';
import AdminImportPage from './AdminImportPage';

type View = 'dashboard' | 'import';

export default function DashboardLayout() {
    const { loggedInUser, setLoggedInUser, setPayments } = useContext(AppContext);
    const [activeView, setActiveView] = useState<View>('dashboard');

    const handleLogout = () => {
        setLoggedInUser(null);
    };
    
    if (!loggedInUser) {
        return null; // Should not happen if logic in page.tsx is correct
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2 className="header-title">מערכת ניהול</h2>
                <div className="user-info">
                    <span>שלום, {loggedInUser.name}</span>
                    <button onClick={handleLogout} className="logout-button">התנתקות</button>
                </div>
            </header>
            <div className="dashboard-body">
                <nav className="dashboard-nav">
                    <ul>
                        {loggedInUser.role === 'admin' && (
                            <>
                                <li className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
                                    ניהול מטופלים
                                </li>
                                <li className={activeView === 'import' ? 'active' : ''} onClick={() => setActiveView('import')}>
                                    ייבוא נתונים
                                </li>
                            </>
                        )}
                        {loggedInUser.role === 'therapist' && (
                            <li className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
                                המטופלים שלי
                            </li>
                        )}
                    </ul>
                </nav>
                <main>
                    {activeView === 'dashboard' && <PaymentsDashboard />}
                    {activeView === 'import' && loggedInUser.role === 'admin' && (
                        <AdminImportPage onImportSuccess={(newPayments) => setPayments(prev => [...prev, ...newPayments])} />
                    )}
                </main>
            </div>
        </div>
    );
}
