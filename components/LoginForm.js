import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useApp } from '../context/AppContext'
import ConstructionBackground from './ConstructionBackground'
import styles from '../styles/Login.module.css'
import { account } from '../lib/appwrite'
import Cookies from 'js-cookie'

export default function LoginForm({ role = 'customer', isOverlay = false }) {
    const router = useRouter()
    const { login, isAuthenticated, userRole, logout } = useApp()

    // Local state for instant role switching
    const [activeRole, setActiveRole] = useState(role)

    // Sync state if URL changes externally
    useEffect(() => {
        if (role && role !== activeRole) {
            setActiveRole(role)
        }
    }, [role])

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Handle OAuth errors
    useEffect(() => {
        if (router.query.error) {
            setError(router.query.error === 'AccessDenied'
                ? 'Access Denied: Please use a permitted account.'
                : 'Authentication failed. Please try again.')
        }
    }, [router.query.error])

    // Lock body scroll when overlay is active
    useEffect(() => {
        if (isOverlay) {
            const originalHtmlOverflow = document.documentElement.style.overflow
            const originalBodyOverflow = document.body.style.overflow

            document.documentElement.style.overflow = 'hidden'
            document.body.style.overflow = 'hidden'

            return () => {
                document.documentElement.style.overflow = originalHtmlOverflow
                document.body.style.overflow = originalBodyOverflow
            }
        }
    }, [isOverlay])

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // If user is already authenticated (e.g. from Google OAuth or existing session)
    // and they are visiting a standalone login page, redirect them to their portal.
    useEffect(() => {
        if (isAuthenticated && userRole && !isOverlay) {
            router.push(`/${userRole}`)
        }
    }, [isAuthenticated, userRole, isOverlay, router])
    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const result = await login(email, password, activeRole)
        if (!result.success) {
            setError(result.message || 'Login failed')
            setLoading(false)
        } else {
            // On success, redirect if we are on a standalone auth page like /login
            // If it's an overlay, AppContext updates will automatically unmount it.
            if (!isOverlay) {
                router.push(`/${activeRole}`)
            }
        }
    }

    const roleConfigs = {
        supplier: {
            title: 'Supplier Portal',
            subtitle: 'Manage your inventory and fulfill massive construction orders.',
            icon: '🏭',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            themeColor: '#764ba2',
            benefits: [
                'Reach 10,000+ verified customers',
                'Real-time inventory management',
                'Automated delivery assignments',
                'Instant secure payments'
            ]
        },
        driver: {
            title: 'Driver Partner',
            subtitle: 'Deliver materials on your schedule and maximize your earnings.',
            icon: '🚚',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            themeColor: '#6366f1',
            benefits: [
                'Choose your own working hours',
                'Optimized route navigation',
                'Performance-based bonuses',
                'Same-day payout options'
            ]
        },
        customer: {
            title: 'Customer Login',
            subtitle: 'Source premium materials from trusted suppliers at the best prices.',
            icon: '🏗️',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
            themeColor: '#d946ef',
            benefits: [
                'Compare real-time price quotes',
                'Verified quality standards',
                'On-site tracking & visibility',
                'Dedicated 24/7 site support'
            ]
        }
    }

    const config = roleConfigs[activeRole] || roleConfigs.customer

    const handleRoleSwitch = (newRole) => {
        setActiveRole(newRole)
        // Also update url without reloading to keep it shareable
        router.push(
            { pathname: '/login', query: { role: newRole } },
            undefined,
            { shallow: true }
        )
    }

    const content = (
        <div className={styles.wrapper}>
            <div className={styles.brandHeader}>
                <Link href="/" className={styles.logoLink}>
                    <span className={styles.logoIcon}>{config.icon}</span>
                    <span className={styles.logoText}>BuildMart</span>
                </Link>
            </div>

            <div className={styles.formSide}>

                <div className={styles.roleSwitcher}>
                    {['supplier', 'customer', 'driver'].map((r) => (
                        <button
                            key={r}
                            className={`${styles.roleTab} ${activeRole === r ? styles.activeTab : ''}`}
                            onClick={() => handleRoleSwitch(r)}
                            type="button"
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                    <div
                        className={styles.tabIndicator}
                        style={{
                            transform: `translateX(${activeRole === 'supplier' ? '0%' :
                                activeRole === 'customer' ? '100%' : '200%'
                                })`,
                            backgroundColor: config.themeColor
                        }}
                    />
                </div>

                <div className={styles.welcomeHeader}>
                    <h1 className={styles.welcomeTitle}>{config.title}</h1>
                    <p className={styles.welcomeSubtitle}>{config.subtitle}</p>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
                    </div>
                )}

                <button
                    type="button"
                    className={styles.googleButton}
                    onClick={() => {
                        const origin = window.location.origin
                        const path = window.location.pathname
                        const successUrl = origin + path
                        const failureUrl = successUrl + '?error=AccessDenied'
                        Cookies.set('auth-role-preference', activeRole, { expires: 1 / 24, path: '/' })
                        account.createOAuth2Session('google', successUrl, failureUrl)
                    }}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="22" height="22" alt="G" />
                    Continue with Google
                </button>

                <div className={styles.divider}>
                    <span>OR CONTINUE WITH EMAIL</span>
                </div>

                <form onSubmit={handleLogin}>
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

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.svgIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className={styles.input}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.eyeIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.svgIcon}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.svgIcon}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className={styles.forgotPassword}>
                        <Link href="/forgot-password" className={styles.tertiaryLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? <div className={styles.loader} style={{ margin: '0 auto' }} /> : 'Sign In'}
                    </button>

                    <div className={styles.formFooter}>
                        Don&apos;t have an account?{' '}
                        <Link href={`/register?role=${activeRole}`} className={styles.link}>
                            Create Account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )

    if (isOverlay) {
        if (!mounted) return null
        return createPortal(
            <div
                className={styles.overlayContainer}
                style={{
                    '--theme-gradient': config.gradient,
                    '--theme-color': config.themeColor
                }}
            >
                {content}
            </div>,
            document.body
        )
    }

    return (
        <div
            className={styles.container}
            style={{
                '--theme-gradient': config.gradient,
                '--theme-color': config.themeColor,
                transition: '--theme-gradient 0.5s ease-in-out, --theme-color 0.5s ease-in-out'
            }}
        >
            <div className={styles.backgroundShapes} />
            <ConstructionBackground />
            {/* The 3 animated background blobs */}
            {content}
        </div>
    )
}
