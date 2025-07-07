
export type UserRole = 'admin' | 'therapist';
export type PatientStatus = 'בהמתנה' | 'בטיפול' | 'סיום טיפול';

export interface User {
    id: string;
    name: string;
    email: string;
    password; // In a real app, this would never be stored client-side
    role: UserRole;
}

export interface Payment {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'שולם' | 'בהמתנה' | 'באיחור';
  invoiceNumber: string;
  patientStatus: PatientStatus;
  therapistId: string | null;
}
