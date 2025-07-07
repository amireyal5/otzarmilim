import type { Payment, User } from '../types/index.ts';

export const mockUsers: User[] = [
    { id: 'admin-1', name: 'מנהל מערכת', email: 'admin@example.com', password: 'password123', role: 'admin' },
    { id: 'therapist-1', name: 'אריאלה כהן', email: 'ariela@example.com', password: 'password123', role: 'therapist' },
    { id: 'therapist-2', name: 'יוסי לוי', email: 'yossi@example.com', password: 'password123', role: 'therapist' },
];

export const mockTherapists = mockUsers.filter(u => u.role === 'therapist');

export const initialMockPayments: Payment[] = [
    { id: '1', patientName: 'ישראל ישראלי', amount: 350, date: '2024-05-20', status: 'שולם', invoiceNumber: 'INV-001', patientStatus: 'סיום טיפול', therapistId: 'therapist-1' },
    { id: '2', patientName: 'יעל כהן', amount: 400, date: '2024-05-22', status: 'בהמתנה', invoiceNumber: 'INV-002', patientStatus: 'בטיפול', therapistId: 'therapist-1' },
    { id: '3', patientName: 'משה לוי', amount: 350, date: '2024-04-15', status: 'באיחור', invoiceNumber: 'INV-003', patientStatus: 'בטיפול', therapistId: 'therapist-2' },
    { id: '4', patientName: 'דנה שפירא', amount: 500, date: '2024-05-18', status: 'שולם', invoiceNumber: 'INV-004', patientStatus: 'סיום טיפול', therapistId: 'therapist-2' },
    { id: '5', patientName: 'אביב גורן', amount: 400, date: '2024-05-23', status: 'בהמתנה', invoiceNumber: 'INV-005', patientStatus: 'בהמתנה', therapistId: null },
    { id: '6', patientName: 'רותם חזן', amount: 350, date: '2024-03-30', status: 'באיחור', invoiceNumber: 'INV-006', patientStatus: 'בהמתנה', therapistId: null },
    { id: '7', patientName: 'שירי מיימון', amount: 450, date: '2024-05-25', status: 'בהמתנה', invoiceNumber: 'INV-007', patientStatus: 'בטיפול', therapistId: 'therapist-1' },
];