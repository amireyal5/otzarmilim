import React, { useState, useEffect, useContext, createContext, useReducer, useCallback, useMemo, FC, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

// ========= 1. TYPES AND MOCK DATA ========= //

type TreatmentStatus = "בהמתנה" | "בטיפול" | "סיום טיפול";
type PaymentStatus = "שולם" | "בהמתנה" | "באיחור" | "פטור";

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email: string;
  treatmentStatus: TreatmentStatus;
  paymentStatus: PaymentStatus;
  startDate: string | null;
  endDate: string | null;
  therapistId: number | null;
}

interface Therapist {
  id: number;
  name: string;
  email: string;
}

type UserRole = 'Admin' | 'Therapist';

interface User {
  id: number;
  email: string;
  role: UserRole;
  therapistId?: number;
}

const mockTherapists: Therapist[] = [
  { id: 1, name: 'ד"ר ישראלה ישראלי', email: 'israela@clinic.com' },
  { id: 2, name: 'ד"ר משה כהן', email: 'moshe@clinic.com' },
  { id: 3, name: 'גב\' אביגיל לוי', email: 'avigail@clinic.com' },
];

const mockPatients: Patient[] = [
  { id: 1, firstName: 'אברהם', lastName: 'יוסף', idNumber: '123456789', phone: '050-1234567', email: 'avi@email.com', treatmentStatus: 'בטיפול', paymentStatus: 'שולם', startDate: '2023-01-15', endDate: null, therapistId: 1 },
  { id: 2, firstName: 'שרה', lastName: 'כהן', idNumber: '234567890', phone: '052-2345678', email: 'sara.c@email.com', treatmentStatus: 'בטיפול', paymentStatus: 'בהמתנה', startDate: '2023-02-20', endDate: null, therapistId: 1 },
  { id: 3, firstName: 'יצחק', lastName: 'לוי', idNumber: '345678901', phone: '053-3456789', email: 'itzik@email.com', treatmentStatus: 'בהמתנה', paymentStatus: 'פטור', startDate: null, endDate: null, therapistId: null },
  { id: 4, firstName: 'רבקה', lastName: 'מזרחי', idNumber: '456789012', phone: '054-4567890', email: 'rivka.m@email.com', treatmentStatus: 'סיום טיפול', paymentStatus: 'שולם', startDate: '2022-11-10', endDate: '2023-05-10', therapistId: 2 },
  { id: 5, firstName: 'יעקב', lastName: 'פרץ', idNumber: '567890123', phone: '055-5678901', email: 'yakov@email.com', treatmentStatus: 'בטיפול', paymentStatus: 'באיחור', startDate: '2023-03-01', endDate: null, therapistId: 2 },
  { id: 6, firstName: 'לאה', lastName: 'ביטון', idNumber: '678901234', phone: '058-6789012', email: 'leab@email.com', treatmentStatus: 'בהמתנה', paymentStatus: 'בהמתנה', startDate: null, endDate: null, therapistId: null },
  { id: 7, firstName: 'משה', lastName: 'דיין', idNumber: '789012345', phone: '050-7890123', email: 'moshed@email.com', treatmentStatus: 'בטיפול', paymentStatus: 'שולם', startDate: '2023-04-12', endDate: null, therapistId: 3 },
  { id: 8, firstName: 'רחל', lastName: 'אברהם', idNumber: '890123456', phone: '052-8901234', email: 'rachel.a@email.com', treatmentStatus: 'בטיפול', paymentStatus: 'שולם', startDate: '2023-05-18', endDate: null, therapistId: 3 },
];

const mockUsers: User[] = [
    { id: 101, email: 'admin@clinic.com', role: 'Admin' },
    { id: 1, email: 'israela@clinic.com', role: 'Therapist', therapistId: 1 },
    { id: 2, email: 'moshe@clinic.com', role: 'Therapist', therapistId: 2 },
    { id: 3, email: 'avigail@clinic.com', role: 'Therapist', therapistId: 3 },
];


// ========= 2. MOCK API SERVICE ========= //

const api = {
  login: async (email: string, pass: string): Promise<User> => {
    console.log(`Attempting login for ${email}`); // Pass is ignored in mock
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          resolve(user);
        } else {
          reject(new Error("אימייל או סיסמה שגויים"));
        }
      }, 500);
    });
  },
  
  getPatients: async (user: User | null): Promise<Patient[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (user?.role === 'Therapist') {
                resolve(mockPatients.filter(p => p.therapistId === user.therapistId));
            } else {
                resolve(mockPatients);
            }
        }, 500);
    });
  },

  getTherapists: async (): Promise<Therapist[]> => {
      return new Promise(resolve => setTimeout(() => resolve(mockTherapists), 300));
  },
  
  updatePatientTherapist: async (patientId: number, therapistId: number | null): Promise<Patient> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const patientIndex = mockPatients.findIndex(p => p.id === patientId);
              if (patientIndex !== -1) {
                  mockPatients[patientIndex].therapistId = therapistId;
                  mockPatients[patientIndex].treatmentStatus = therapistId ? 'בטיפול' : 'בהמתנה';
                  if(therapistId && !mockPatients[patientIndex].startDate) {
                    mockPatients[patientIndex].startDate = new Date().toISOString().split('T')[0];
                  }
                  resolve(mockPatients[patientIndex]);
              } else {
                  reject(new Error("Patient not found"));
              }
          }, 400);
      })
  },

  importPatients: async (newPatients: Omit<Patient, 'id' | 'therapistId'>[]): Promise<{count: number}> => {
      return new Promise(resolve => {
        setTimeout(() => {
            const currentMaxId = mockPatients.length > 0 ? Math.max(...mockPatients.map(p => p.id)) : 0;
            newPatients.forEach((p, i) => {
                mockPatients.push({ ...p, id: currentMaxId + i + 1, therapistId: null });
            });
            resolve({ count: newPatients.length });
        }, 1000);
      });
  }
};

// ========= 3. AUTHENTICATION ========= //

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await api.login(email, pass);
      setUser(userData);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, isAuthenticated: !!user, login, logout, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// ========= 4. ROUTING ========= //
// Simple hash-based router to work in this environment
const useHashRouter = () => {
    const [path, setPath] = useState(window.location.hash.slice(1) || '/');
    
    useEffect(() => {
        const handleHashChange = () => setPath(window.location.hash.slice(1) || '/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = useCallback((to: string) => {
        window.location.hash = to;
    }, []);

    return { path, navigate };
};


// ========= 5. UI & HELPER COMPONENTS ========= //

const FullScreenSpinner: FC = () => (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        <div className="spinner"></div>
    </div>
);

const SearchIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const UploadIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const LogoutIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const UsersIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const ClinicIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

const StatusBadge: FC<{ status: PaymentStatus | TreatmentStatus }> = ({ status }) => {
    const statusClass = {
        'שולם': 'paid', 'בהמתנה': 'pending', 'באיחור': 'overdue', 'פטור': 'exempt',
        'בטיפול': 'in-treatment', 'סיום טיפול': 'completed'
    }[status] || 'default';
    
    // special case for 'בהמתנה' to differentiate
    const finalClass = status === 'בהמתנה' ? (Object.values(treatmentStatuses).includes(status as TreatmentStatus) ? 'waiting' : 'pending') : statusClass

    return <span className={`status-badge ${finalClass}`}>{status}</span>;
};

// ========= 6. FEATURE COMPONENTS ========= //

const LoginScreen: FC = () => {
    const [email, setEmail] = useState('admin@clinic.com');
    const [password, setPassword] = useState('password');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            // Redirect is handled by the main App component's useEffect
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>מערכת ניהול מטופלים</h1>
                <p>נא להתחבר לחשבונך</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">אימייל</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">סיסמה</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : 'התחברות'}
                    </button>
                </form>
            </div>
        </div>
    );
};

interface PatientTableProps {
    patients: Patient[];
    therapists?: Therapist[];
    isAdmin: boolean;
    onUpdateTherapist?: (patientId: number, therapistId: number | null) => Promise<void>;
    isLoading: boolean;
}

const PatientTable: FC<PatientTableProps> = ({ patients, therapists, isAdmin, onUpdateTherapist, isLoading }) => {
    const [updatingPatientId, setUpdatingPatientId] = useState<number|null>(null);

    const handleTherapistChange = async (patientId: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!onUpdateTherapist) return;
        const newTherapistId = e.target.value ? Number(e.target.value) : null;
        setUpdatingPatientId(patientId);
        try {
            await onUpdateTherapist(patientId, newTherapistId);
        } catch (error) {
            console.error("Failed to update therapist", error);
            // Here you would show an error toast to the user
        } finally {
            setUpdatingPatientId(null);
        }
    };

    return (
        <div className="table-wrapper">
            <table className="patient-table">
                <thead>
                    <tr>
                        <th>שם מלא</th>
                        <th>טלפון</th>
                        <th>אימייל</th>
                        <th>סטטוס טיפול</th>
                        <th>סטטוס תשלום</th>
                        <th>תאריך התחלה</th>
                        {isAdmin && <th>מטפל/ת</th>}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr className="loading-row">
                            <td colSpan={isAdmin ? 7 : 6}><div className="spinner"></div></td>
                        </tr>
                    ) : patients.length === 0 ? (
                        <tr className="loading-row">
                            <td colSpan={isAdmin ? 7 : 6}>לא נמצאו מטופלים</td>
                        </tr>
                    ) : (
                        patients.map(patient => (
                            <tr key={patient.id}>
                                <td>{`${patient.firstName} ${patient.lastName}`}</td>
                                <td>{patient.phone}</td>
                                <td>{patient.email}</td>
                                <td><StatusBadge status={patient.treatmentStatus} /></td>
                                <td><StatusBadge status={patient.paymentStatus} /></td>
                                <td>{patient.startDate || 'טרם נקבע'}</td>
                                {isAdmin && therapists && (
                                    <td>
                                        {updatingPatientId === patient.id ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : (
                                            <select
                                                className="select"
                                                value={patient.therapistId || ''}
                                                onChange={(e) => handleTherapistChange(patient.id, e)}
                                                disabled={!onUpdateTherapist}
                                            >
                                                <option value="">לא משובץ</option>
                                                {therapists.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

const treatmentStatuses: TreatmentStatus[] = ["בהמתנה", "בטיפול", "סיום טיפול"];
const paymentStatuses: PaymentStatus[] = ["שולם", "בהמתנה", "באיחור", "פטור"];

const PatientManagementView: FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { user } = useAuth();
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [treatmentFilter, setTreatmentFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Use a local copy of the user object to prevent stale closures
            const currentUser = user;
            const [patientData, therapistData] = await Promise.all([
                api.getPatients(currentUser),
                isAdmin ? api.getTherapists() : Promise.resolve([])
            ]);
            setAllPatients(patientData);
            setTherapists(therapistData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, isAdmin]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleUpdateTherapist = async (patientId: number, therapistId: number | null) => {
        await api.updatePatientTherapist(patientId, therapistId);
        // Refetch to get the latest state
        fetchAllData();
    };

    const filteredPatients = useMemo(() => {
        return allPatients
            .filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => treatmentFilter ? p.treatmentStatus === treatmentFilter : true)
            .filter(p => paymentFilter ? p.paymentStatus === paymentFilter : true);
    }, [allPatients, searchTerm, treatmentFilter, paymentFilter]);

    const paginatedPatients = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredPatients.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredPatients, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

    return (
        <div className="card">
            <div className="table-controls">
                <div className="search-filter-container">
                    <div className="search-input-wrapper">
                        <SearchIcon/>
                        <input 
                            type="text" 
                            placeholder="חיפוש לפי שם..." 
                            className="input" 
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="select" value={treatmentFilter} onChange={e => { setTreatmentFilter(e.target.value); setPage(1); }}>
                            <option value="">כל סטטוסי הטיפול</option>
                            {treatmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="select" value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}>
                            <option value="">כל סטטוסי התשלום</option>
                            {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                 <button className="btn btn-secondary" onClick={() => {
                    setSearchTerm(''); setTreatmentFilter(''); setPaymentFilter(''); setPage(1);
                 }}>איפוס פילטרים</button>
            </div>
            <PatientTable 
                patients={paginatedPatients}
                therapists={therapists}
                isAdmin={isAdmin}
                onUpdateTherapist={isAdmin ? handleUpdateTherapist : undefined}
                isLoading={isLoading}
            />
            <div className="pagination">
                <span>
                    מציג {paginatedPatients.length} מתוך {filteredPatients.length} מטופלים
                </span>
                {totalPages > 1 && (
                    <div className="buttons">
                        <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>הקודם</button>
                        <span>עמוד {page} מתוך {totalPages}</span>
                        <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>הבא</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CsvImportView: FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
    const { navigate } = useHashRouter();

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const selectedFile = files[0];
            if (selectedFile.type === "text/csv") {
                setFile(selectedFile);
                setErrors([]);
                setImportSuccessCount(null);
            } else {
                setErrors(["יש לבחור קובץ מסוג CSV בלבד."]);
                setFile(null);
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

    const processImport = () => {
        if (!file) return;

        setIsProcessing(true);
        setErrors([]);
        setImportSuccessCount(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const validationErrors: string[] = [];
            const newPatients: Omit<Patient, 'id' | 'therapistId'>[] = [];

            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) {
                validationErrors.push("הקובץ ריק או מכיל רק כותרת.");
            } else {
                const headers = lines[0].split(',').map(h => h.trim());
                const requiredHeaders = ['שם פרטי', 'שם משפחה', 'טלפון', 'אימייל', 'סטטוס טיפול', 'סטטוס תשלום'];
                const headerMap: { [key: string]: keyof Omit<Patient, 'id' | 'therapistId' | 'idNumber' | 'startDate' | 'endDate'> } = {
                    'שם פרטי': 'firstName', 'שם משפחה': 'lastName', 'טלפון': 'phone',
                    'אימייל': 'email', 'סטטוס טיפול': 'treatmentStatus', 'סטטוס תשלום': 'paymentStatus',
                };
                
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    validationErrors.push(`קובץ CSV חסר עמודות חובה: ${missingHeaders.join(', ')}`);
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim());
                        const rowData: Partial<Patient> = {};
                        headers.forEach((header, index) => {
                            const key = headerMap[header];
                            if (key) {
                                (rowData as any)[key] = values[index];
                            }
                        });

                        if (!rowData.firstName || !rowData.lastName) { validationErrors.push(`שורה ${i + 1}: שם פרטי ושם משפחה הם חובה.`); continue; }
                        if (!rowData.email || !emailRegex.test(rowData.email)) { validationErrors.push(`שורה ${i + 1}: אימייל לא תקין: ${rowData.email || '""'}.`); continue; }
                        if (!rowData.treatmentStatus || !treatmentStatuses.includes(rowData.treatmentStatus)) { validationErrors.push(`שורה ${i + 1}: סטטוס טיפול לא מוכר: ${rowData.treatmentStatus || '""'}.`); continue; }
                        if (!rowData.paymentStatus || !paymentStatuses.includes(rowData.paymentStatus)) { validationErrors.push(`שורה ${i + 1}: סטטוס תשלום לא מוכר: ${rowData.paymentStatus || '""'}.`); continue; }

                        newPatients.push({
                            firstName: rowData.firstName, lastName: rowData.lastName, idNumber: '', phone: rowData.phone || '',
                            email: rowData.email, treatmentStatus: rowData.treatmentStatus, paymentStatus: rowData.paymentStatus,
                            startDate: null, endDate: null,
                        });
                    }
                }
            }

            if (validationErrors.length > 0) {
                setErrors(validationErrors.slice(0, 10));
                setIsProcessing(false);
            } else {
                try {
                    const result = await api.importPatients(newPatients);
                    setImportSuccessCount(result.count);
                    setTimeout(() => navigate('/admin/patients'), 2500);
                } catch (apiError) {
                    setErrors(["שגיאה בעת ייבוא הנתונים לשרת."]);
                } finally {
                    setIsProcessing(false);
                }
            }
        };

        reader.readAsText(file, 'UTF-8');
    };

    return (
        <div className="card import-container">
            <div 
                className={`drop-zone ${isDragging ? 'active' : ''}`}
                onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input type="file" id="file-upload" accept=".csv" hidden onChange={(e) => handleFileChange(e.target.files)} />
                <UploadIcon />
                <p>{file ? file.name : 'גרור ושחרר קובץ CSV לכאן, או לחץ לבחירה'}</p>
                <button type="button" className="btn btn-secondary">בחר קובץ</button>
            </div>
            
            {errors.length > 0 && (
                <div className="error-list">
                    <h4>{`נמצאו ${errors.length > 1 ? `${errors.length} שגיאות` : 'שגיאה' } (מציג עד 10):`}</h4>
                    <ul>{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
                </div>
            )}
            
            {importSuccessCount !== null && (
                <div className="success-message">
                    <p>{importSuccessCount} מטופלים יובאו בהצלחה! הנך מועבר/ת בחזרה לרשימת המטופלים.</p>
                </div>
            )}
            
            <div className="import-actions">
                <button className="btn btn-primary" onClick={processImport} disabled={!file || isProcessing || errors.length > 0}>
                    {isProcessing ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : 'ייבוא נתונים'}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/patients')}>
                    חזרה לניהול מטופלים
                </button>
            </div>
        </div>
    );
};


// ========= 7. DASHBOARD & APP LAYOUT ========= //

const DashboardLayout: FC<{ children: ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const { path, navigate } = useHashRouter();
    
    const isAdmin = user?.role === 'Admin';
    
    const navLinks = isAdmin
        ? [
            { path: '/admin/patients', label: 'ניהול מטופלים', icon: <UsersIcon /> },
            { path: '/admin/import', label: 'ייבוא נתונים', icon: <UploadIcon /> },
          ]
        : [
            { path: '/therapist/patients', label: 'המטופלים שלי', icon: <UsersIcon /> },
          ];

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo"><ClinicIcon /></div>
                    <h2>מערכת ניהול</h2>
                </div>
                <nav>
                    {navLinks.map(link => (
                        <a 
                            key={link.path} 
                            href={`#${link.path}`}
                            className={path.startsWith(link.path) ? 'active' : ''}
                            onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                            title={link.label}
                        >
                            {link.icon} <span>{link.label}</span>
                        </a>
                    ))}
                </nav>
                <div className="user-profile">
                    <div className="user-info">
                        <span className="email">{user?.email}</span>
                        <span className="role">{user?.role}</span>
                    </div>
                    <button onClick={logout} className="btn btn-logout" title="התנתקות">
                        <LogoutIcon /> <span>התנתקות</span>
                    </button>
                </div>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

const App: FC = () => {
    const { isAuthenticated, user } = useAuth();
    const { path, navigate } = useHashRouter();

    useEffect(() => {
        if (isAuthenticated) {
            if (path === '/login' || path === '/') {
                 if (user?.role === 'Admin') navigate('/admin/patients');
                 else if (user?.role === 'Therapist') navigate('/therapist/patients');
            }
        } else {
            if (path !== '/login') {
                navigate('/login');
            }
        }
    }, [isAuthenticated, user, path, navigate]);

    if (!isAuthenticated) {
        return path === '/login' ? <LoginScreen /> : <FullScreenSpinner />;
    }

    const renderPage = () => {
        if (user?.role === 'Admin') {
            if (path.startsWith('/admin/patients')) {
                return <>
                    <div className="page-header"><h1>ניהול מטופלים</h1></div>
                    <PatientManagementView isAdmin={true} />
                </>;
            }
            if (path.startsWith('/admin/import')) {
                return <>
                    <div className="page-header"><h1>ייבוא נתונים מקובץ CSV</h1></div>
                    <CsvImportView />
                </>;
            }
            // Fallback for any other admin route
            navigate('/admin/patients');
            return <FullScreenSpinner />;
        }
        
        if (user?.role === 'Therapist') {
             if (path.startsWith('/therapist/patients')) {
                return <>
                    <div className="page-header"><h1>המטופלים שלי</h1></div>
                    <PatientManagementView isAdmin={false} />
                </>;
            }
            // Fallback for any other therapist route
            navigate('/therapist/patients');
            return <FullScreenSpinner />;
        }
        
        return <FullScreenSpinner />;
    };
    
    return (
        <DashboardLayout>
            {renderPage()}
        </DashboardLayout>
    );
};


// ========= 8. APP INITIALIZATION ========= //

const container = document.getElementById('root');
if (!container) throw new Error("Root element not found");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
