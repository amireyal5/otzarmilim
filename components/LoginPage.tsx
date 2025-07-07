
'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { mockUsers } from '@/lib/data';

export default function LoginPage() {
    const { setLoggedInUser } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 1000));

        const foundUser = mockUsers.find(user => user.email === email);

        if (foundUser && foundUser.password === password) {
            setLoggedInUser(foundUser);
        } else {
            setError('האימייל או הסיסמה שהזנת אינם נכונים.');
        }

        setIsLoading(false);
    };

    return (
        <div className="login-container">
            <h1>מרכז הורות</h1>
            <p>כניסה למערכת ניהול מטופלים</p>
            <form onSubmit={handleSubmit} noValidate>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="email">כתובת אימייל</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">סיסמה</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? 'מתחבר...' : 'כניסה'}
                </button>
            </form>
            <a href="#" className="forgot-password">שכחת סיסמה?</a>
        </div>
    );
}
