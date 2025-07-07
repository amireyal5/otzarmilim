
'use client';

import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { mockTherapists } from '@/lib/data';
import type { Payment, PatientStatus } from '@/lib/types';

const getPaymentStatusClass = (status: Payment['status']) => {
    switch (status) {
        case 'שולם': return 'status-paid';
        case 'בהמתנה': return 'status-pending';
        case 'באיחור': return 'status-overdue';
        default: return '';
    }
};

const getPatientStatusClass = (status: PatientStatus) => {
    switch (status) {
        case 'בטיפול': return 'patient-status-in-treatment';
        case 'בהמתנה': return 'patient-status-waiting';
        case 'סיום טיפול': return 'patient-status-finished';
        default: return '';
    }
};


export default function PaymentsDashboard() {
    const { loggedInUser, payments, setPayments } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('הכל');
    const [patientStatusFilter, setPatientStatusFilter] = useState('הכל');

    const handleAssignTherapist = (paymentId: string, therapistId: string) => {
        setPayments(prevPayments =>
            prevPayments.map(p =>
                p.id === paymentId ? { ...p, therapistId: therapistId } : p
            )
        );
    };

    const filteredPayments = useMemo(() => {
        if (!loggedInUser) return [];

        let items = loggedInUser.role === 'admin' 
            ? payments 
            : payments.filter(p => p.therapistId === loggedInUser.id);

        return items
            .filter(payment =>
                payment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(payment =>
                paymentStatusFilter === 'הכל' ? true : payment.status === paymentStatusFilter
            )
            .filter(payment =>
                patientStatusFilter === 'הכל' ? true : payment.patientStatus === patientStatusFilter
            );
    }, [searchTerm, paymentStatusFilter, patientStatusFilter, payments, loggedInUser]);

    if (!loggedInUser) return null;

    return (
        <div className="payments-dashboard">
            <h3>{loggedInUser.role === 'admin' ? 'ניהול כלל המטופלים' : 'המטופלים שלי'}</h3>
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="חיפוש לפי שם מטופל..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="filter-select">
                    <option value="הכל">סינון לפי תשלום</option>
                    <option value="שולם">שולם</option>
                    <option value="בהמתנה">בהמתנה</option>
                    <option value="באיחור">באיחור</option>
                </select>
                <select value={patientStatusFilter} onChange={(e) => setPatientStatusFilter(e.target.value)} className="filter-select">
                    <option value="הכל">סינון לפי סטטוס טיפול</option>
                    <option value="בהמתנה">בהמתנה</option>
                    <option value="בטיפול">בטיפול</option>
                    <option value="סיום טיפול">סיום טיפול</option>
                </select>
            </div>
            <div className="table-container">
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th>שם המטופל</th>
                            <th>סטטוס טיפול</th>
                            <th>מטפל/ת משויך/ת</th>
                            <th>סכום (₪)</th>
                            <th>סטטוס תשלום</th>
                            <th>תאריך תשלום</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map(payment => {
                                const therapist = mockTherapists.find(t => t.id === payment.therapistId);
                                return (
                                <tr key={payment.id}>
                                    <td>{payment.patientName}</td>
                                    <td>
                                        <span className={`status-badge ${getPatientStatusClass(payment.patientStatus)}`}>
                                            {payment.patientStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {loggedInUser.role === 'admin' && !therapist ? (
                                            <select 
                                                defaultValue=""
                                                onChange={(e) => handleAssignTherapist(payment.id, e.target.value)}
                                                className="filter-select"
                                            >
                                                <option value="" disabled>שבץ מטפל/ת</option>
                                                {mockTherapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        ) : (
                                            therapist?.name || 'לא שובץ'
                                        )}
                                    </td>
                                    <td>{payment.amount}</td>
                                    <td>
                                        <span className={`status-badge ${getPaymentStatusClass(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>{payment.date}</td>
                                </tr>
                            )})
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>לא נמצאו רשומות תואמות.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
