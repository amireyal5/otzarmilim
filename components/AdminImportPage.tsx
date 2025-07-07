
'use client';

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import type { Payment, PatientStatus } from '@/lib/types';

interface AdminImportPageProps {
    onImportSuccess: (newPayments: Payment[]) => void;
}

export default function AdminImportPage({ onImportSuccess }: AdminImportPageProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFile = (file: File) => {
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setMessage({ type: 'error', text: 'אנא העלה קובץ CSV בלבד.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        Papa.parse<any>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const requiredHeaders = ['patientName', 'amount', 'date', 'status', 'patientStatus'];
                    const actualHeaders = results.meta.fields || [];
                    
                    const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
                    if(missingHeaders.length > 0) {
                        throw new Error(`הקובץ חסר את העמודות הבאות: ${missingHeaders.join(', ')}`);
                    }

                    const newPayments: Payment[] = results.data.map((row, index) => {
                        if (!row.patientName || !row.amount || !row.date || !row.status || !row.patientStatus) {
                            throw new Error(`שורה ${index + 2} בקובץ מכילה נתונים חסרים.`);
                        }

                        return {
                            id: `imported-${Date.now()}-${index}`,
                            patientName: row.patientName,
                            amount: Number(row.amount),
                            date: row.date,
                            status: row.status as Payment['status'],
                            invoiceNumber: `IMP-${Date.now()}`,
                            patientStatus: row.patientStatus as PatientStatus,
                            therapistId: null,
                        };
                    });

                    onImportSuccess(newPayments);
                    setMessage({ type: 'success', text: `ייבוא הושלם בהצלחה! נוספו ${newPayments.length} רשומות חדשות.` });
                } catch (error: any) {
                    setMessage({ type: 'error', text: `שגיאה בעיבוד הקובץ: ${error.message}` });
                } finally {
                    setIsLoading(false);
                }
            },
            error: (error) => {
                setMessage({ type: 'error', text: `שגיאה בניתוח הקובץ: ${error.message}` });
                setIsLoading(false);
            },
        });
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="import-page">
            <h3>ייבוא נתונים מקובץ CSV</h3>
            <p>גרור קובץ לאזור המקווקו או לחץ לבחירת קובץ.</p>
            <input type="file" id="file-upload" accept=".csv" onChange={handleChange} style={{ display: 'none' }} />
            <label 
                htmlFor="file-upload" 
                className={`drop-zone ${isDragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {isLoading ? <div className="loading-spinner"></div> : <p>גרור קובץ לכאן או לחץ לבחירה</p>}
            </label>

            {message && (
                <div className={`import-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="import-instructions">
                <h4>הנחיות למבנה הקובץ</h4>
                <p>הקובץ חייב להיות בפורמט CSV ולכלול את העמודות הבאות בשורה הראשונה:</p>
                <code>patientName, amount, date, status, patientStatus</code>
            </div>
        </div>
    );
}
