import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { account } from '../lib/appwrite'
import styles from '../styles/Login.module.css'

export default function ResetPassword() {
    const router = useRouter()
    const { userId, secret } = router.query

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        if (password.length < 8) {
            setStatus('error')
            setMessage('Password must be at least 8 characters long.')
            return
        }

        if (password !== confirmPassword) {
            setStatus('error')
            setMessage('Passwords do not match.')
            return
        }

        if (!userId || !secret) {
            setStatus('error')
            setMessage('Invalid reset link. Please request a new password recovery email.')
            return
        }

        try {
            // Appwrite updateRecovery requires: userId, secret, password, passwordAgain
            await account.updateRecovery(userId, secret, password, confirmPassword)
            setStatus('success')
            setMessage('Your password has been successfully reset.')
        } catch (error) {
            setStatus('error')
            setMessage(error.message || 'Failed to reset password. The link may have expired.')
        }
    }

    // Hide until we have query params to prevent hydration mismatch
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className={styles.container}>
            <div className={styles.wrapper} style={{ maxWidth: '400px' }}>
                <div className={styles.brandHeader}>
                    <Link href="/" className={styles.logoLink}>
                        <span className={styles.logoText}>BuildMart</span>
                    </Link>
                </div>

                <div className={styles.welcomeHeader}>
                    <h1 className={styles.welcomeTitle} style={{ fontSize: '1.75rem' }}>Create New Password</h1>
                    <p className={styles.welcomeSubtitle}>
                        Enter your new password below.
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
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.svgIcon}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    className={styles.input}
                                    placeholder="New Password (min 8 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.svgIcon}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className={styles.input}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={status === 'loading'} style={{ marginTop: '1rem' }}>
                            {status === 'loading' ? <div className={styles.loader} style={{ margin: '0 auto' }} /> : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
