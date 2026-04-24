import { useState } from 'react'
import Link from 'next/link'
import { account } from '../lib/appwrite'
import styles from '../styles/Login.module.css'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        try {
            // Appwrite requires the URL to redirect to after clicking the reset link in the email
            const resetUrl = `${window.location.origin}/reset-password`
            await account.createRecovery(email, resetUrl)
            setStatus('success')
            setMessage('A password recovery link has been sent to your email.')
        } catch (error) {
            setStatus('error')
            setMessage(error.message || 'Failed to send recovery email. Please try again.')
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper} style={{ maxWidth: '400px' }}>
                <div className={styles.brandHeader}>
                    <Link href="/" className={styles.logoLink}>
                        <span className={styles.logoText}>BuildMart</span>
                    </Link>
                </div>

                <div className={styles.welcomeHeader}>
                    <h1 className={styles.welcomeTitle} style={{ fontSize: '1.75rem' }}>Reset Password</h1>
                    <p className={styles.welcomeSubtitle}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'error' && (
                    <div className={styles.errorBanner}>
                        <span>{message}</span>
                        <button onClick={() => setStatus('idle')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
                    </div>
                )}

                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--success, #10b981)', marginBottom: '1.5rem', fontSize: '3rem' }}>
                            ✓
                        </div>
                        <p style={{ color: '#0f172a', fontWeight: '500', marginBottom: '2rem' }}>{message}</p>
                        <Link href="/login" className={styles.submitButton} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.svgIcon}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    className={styles.input}
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={status === 'loading'} style={{ marginTop: '1rem' }}>
                            {status === 'loading' ? <div className={styles.loader} style={{ margin: '0 auto' }} /> : 'Send Recovery Link'}
                        </button>

                        <div className={styles.formFooter} style={{ marginTop: '1.5rem' }}>
                            Remember your password?{' '}
                            <Link href="/login" className={styles.link}>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
