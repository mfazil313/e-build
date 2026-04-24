import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useApp } from '../context/AppContext'
import { account } from '../lib/appwrite'
import Cookies from 'js-cookie'
import ConstructionBackground from '../components/ConstructionBackground'
import styles from '../styles/Register.module.css'

export default function Register() {
    const router = useRouter()
    const { role } = router.query
    const { login, register } = useApp()

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        // Role specific fields
        businessName: '',
        gstNumber: '',
        vehicleType: '',
        vehicleNumber: '',
        licenseNumber: ''
    })
    const [showPassword, setShowPassword] = useState(false)

    // Get configuration based on role
    const getRoleConfig = () => {
        switch (role) {
            case 'supplier':
                return {
                    title: 'Join as Supplier',
                    subtitle: 'Start selling your construction materials today.',
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    themeColor: '#764ba2',
                    icon: '🏭',
                    steps: ['Basic Info', 'Business Details', 'Verification']
                }
            case 'driver':
                return {
                    title: 'Join as Driver',
                    subtitle: 'Earn money delivering materials on your schedule.',
                    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    themeColor: '#6366f1',
                    icon: '🚚',
                    steps: ['Personal Info', 'Vehicle Details', 'Documents']
                }
            case 'customer':
            default:
                return {
                    title: 'Create Account',
                    subtitle: 'Join BuildMart to find the best construction materials.',
                    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                    themeColor: '#d946ef',
                    icon: '🏗️',
                    steps: ['Personal Info', 'Address', 'Complete']
                }
        }
    }

    const config = getRoleConfig()
    const targetRole = role || 'customer'

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = (e) => {
        e.preventDefault()
        setStep(prev => prev + 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const details = {
            phone: formData.phone,
            address: formData.address,
            avatar: '👤'
        }

        // Add role-specific data
        if (targetRole === 'supplier') {
            details.businessName = formData.businessName
            details.gstNumber = formData.gstNumber
            details.isVerified = true
        } else if (targetRole === 'driver') {
            details.vehicle = {
                type: formData.vehicleType,
                number: formData.vehicleNumber
            }
            details.licenseNumber = formData.licenseNumber
            details.isVerified = true
            details.rating = 5.0
        }

        const userData = {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: targetRole,
            details
        }

        const result = await register(userData)

        if (result.success) {
            router.push(`/${targetRole}`)
        } else {
            alert(result.message)
        }
    }

    return (
        <div
            className={styles.container}
            style={{
                '--theme-gradient': config.gradient,
                '--theme-color': config.themeColor
            }}
        >
            <div className={styles.backgroundShapes} />
            <ConstructionBackground />
            <div className={styles.wrapper}>
                <div className={styles.formSide}>
                    <div className={styles.brandHeader}>
                        <Link href="/" className={styles.logoLink}>
                            <span className={styles.logoIcon}>{config.icon}</span>
                            <span className={styles.logoText}>BuildMart</span>
                        </Link>
                    </div>

                    <div className={styles.welcomeHeader}>
                        <h1 className={styles.welcomeTitle}>{config.title}</h1>
                        <p className={styles.welcomeSubtitle}>{config.subtitle}</p>
                    </div>

                    <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Already have an account? <Link href={`/${targetRole}`} className={styles.tertiaryLink} style={{ display: 'inline', width: 'auto', padding: '0', background: 'none', border: 'none', color: 'var(--theme-color)', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                            Sign in
                        </Link>
                    </p>

                    <form className={styles.form} onSubmit={step === 3 ? handleSubmit : handleNext}>
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <button
                                    type="button"
                                    className={styles.googleButton}
                                    onClick={() => {
                                        const origin = window.location.origin
                                        const path = window.location.pathname
                                        const successUrl = origin + `/${targetRole}`
                                        const failureUrl = successUrl + '?error=AccessDenied'
                                        Cookies.set('auth-role-preference', targetRole, { expires: 1 / 24, path: '/' })
                                        account.createOAuth2Session('google', successUrl, failureUrl)
                                    }}
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="22" height="22" alt="G" />
                                    Continue with Google
                                </button>

                                <div className={styles.divider}>
                                    <span>OR CONTINUE WITH EMAIL</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Password</label>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Create a strong password"
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
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Role Specific Info */}
                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <h2>
                                    {targetRole === 'supplier' ? 'Business Details' :
                                        targetRole === 'driver' ? 'Vehicle Details' : 'Address Details'}
                                </h2>

                                {targetRole === 'supplier' && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label>Business Name</label>
                                            <input
                                                type="text"
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                placeholder="ABC Supplies"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>GST Number</label>
                                            <input
                                                type="text"
                                                name="gstNumber"
                                                value={formData.gstNumber}
                                                onChange={handleInputChange}
                                                placeholder="GSTIN123456789"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {targetRole === 'driver' && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label>Vehicle Type</label>
                                            <select
                                                name="vehicleType"
                                                value={formData.vehicleType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Vehicle</option>
                                                <option value="Tata Ace">Tata Ace</option>
                                                <option value="Pickup Truck">Pickup Truck</option>
                                                <option value="Truck">Heavy Truck</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Vehicle Number</label>
                                            <input
                                                type="text"
                                                name="vehicleNumber"
                                                value={formData.vehicleNumber}
                                                onChange={handleInputChange}
                                                placeholder="DL 1 AB 1234"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {targetRole === 'customer' && (
                                    <div className={styles.formGroup}>
                                        <label>Delivery Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full address"
                                            rows="4"
                                            required
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Verification/Complete */}
                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.verificationCheck}>
                                    <span className={styles.checkIcon}>✅</span>
                                    <h2>Data Verification</h2>
                                    <p>We&apos;ll verify your details automatically.</p>
                                </div>

                                <div className={styles.summaryBox}>
                                    <div className={styles.summaryRow}>
                                        <span>Name:</span> <strong>{formData.name}</strong>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Email:</span> <strong>{formData.email}</strong>
                                    </div>
                                    {targetRole === 'driver' && (
                                        <div className={styles.formGroup}>
                                            <label>License Number</label>
                                            <input
                                                type="text"
                                                name="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={handleInputChange}
                                                placeholder="DL-1234567890123"
                                                required
                                            />
                                        </div>
                                    )}
                                    {targetRole === 'supplier' && (
                                        <div className={styles.formGroup}>
                                            <label>Business Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Warehouse/Shop Address"
                                                rows="3"
                                                required
                                            ></textarea>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.terms}>
                                    <input type="checkbox" required id="terms" />
                                    <label htmlFor="terms">I agree to the Terms & Conditions</label>
                                </div>
                            </div>
                        )}

                        <div className={styles.actions}>
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(s => s - 1)} className={styles.backButton}>
                                    Back
                                </button>
                            )}
                            <button type="submit" className={styles.nextButton}>
                                {step === 3 ? 'Create Account' : 'Next Step →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
