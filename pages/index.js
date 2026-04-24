import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'

// Animates a number from 0 to `end` over `duration`ms
function useCountUp(end, duration = 1800, suffix = '') {
    const [count, setCount] = useState(0)
    const startedRef = useRef(false)

    useEffect(() => {
        if (startedRef.current) return
        startedRef.current = true
        let startTime = null
        let animationFrameId = null
        let timeoutId = null

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) animationFrameId = requestAnimationFrame(step)
        }
        // Small delay so animation is visible after page paint
        timeoutId = setTimeout(() => {
            animationFrameId = requestAnimationFrame(step)
        }, 300)

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
            if (animationFrameId) cancelAnimationFrame(animationFrameId)
        }
    }, [end, duration])

    return count
}

export default function Home() {
    const [selectedRole, setSelectedRole] = useState(null)

    // Count-up values
    const suppliers = useCountUp(500, 1800)
    const products = useCountUp(10, 2000)   // shown as Xk+
    const support = useCountUp(24, 1200)   // shown as 24/7

    const roles = [
        {
            id: 'supplier',
            title: 'Supplier',
            icon: '🏭',
            description: 'Sell construction materials and manage your inventory',
            features: ['List products', 'Manage orders', 'Track payments', 'Grow your business'],
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            link: '/supplier',
        },
        {
            id: 'customer',
            title: 'Customer',
            icon: '👷',
            description: 'Browse and order construction materials with ease',
            features: ['Find best prices', 'Compare suppliers', 'Quick delivery', 'Track orders'],
            color: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', // Violet to Fuchsia
            link: '/customer',
        },
        {
            id: 'driver',
            title: 'Driver',
            icon: '🚚',
            description: 'Accept delivery jobs and earn on your schedule',
            features: ['Flexible hours', 'Daily payouts', 'GPS navigation', 'Track earnings'],
            color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
            link: '/driver',
        },
    ]

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🏗️</span>
                        <span className={styles.logoText}>BuildMart</span>
                    </div>
                    <div className={styles.navLinks}>
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it Works</a>
                        <a href="#contact">Contact</a>
                        <Link href="/customer" className={styles.navCta}>Get Started →</Link>
                    </div>
                </div>
            </nav>

            {/* ── Scrolling Materials Marquee ─────────── */}
            <div className={styles.marqueeBar}>
                <div className={styles.marqueeTrack}>
                    {[
                        '🧱 Bricks', '🪵 Timber', '⚙️ Steel Rods', '🏜️ River Sand',
                        '🪨 Aggregate', '🔩 Nuts & Bolts', '💧 PVC Pipes', '🏗️ TMT Bars',
                        '🔌 Electrical Wire', '🏡 Roofing Sheets', '🧴 Wall Putty',
                        '🪟 Glass Panels', '🛢️ Bitumen', '🔧 Hand Tools', '🧰 Cement Bags',
                        '🧱 Bricks', '🪵 Timber', '⚙️ Steel Rods', '🏜️ River Sand',
                        '🪨 Aggregate', '🔩 Nuts & Bolts', '💧 PVC Pipes', '🏗️ TMT Bars',
                        '🔌 Electrical Wire', '🏡 Roofing Sheets', '🧴 Wall Putty',
                        '🪟 Glass Panels', '🛢️ Bitumen', '🔧 Hand Tools', '🧰 Cement Bags',
                    ].map((item, i) => (
                        <span key={i} className={styles.marqueeItem}>
                            {item}
                            <span className={styles.marqueeDot}>•</span>
                        </span>
                    ))}
                </div>
            </div>

            <main className={styles.main}>
                {/* Background Animation */}
                <div className={styles.backgroundShapes}>
                    <div className={styles.shape1}></div>
                    <div className={styles.shape2}></div>
                    <div className={styles.shape3}></div>
                </div>

                {/* Hero Section */}
                <section className={styles.hero}>
                    {/* Floating construction icons in background */}
                    <div className={styles.floatingIcons} aria-hidden="true">
                        <span className={styles.floatIcon} style={{ top: '12%', left: '6%', fontSize: '3.5rem', animationDelay: '0s' }}>🏗️</span>
                        <span className={styles.floatIcon} style={{ top: '20%', right: '7%', fontSize: '3rem', animationDelay: '1.2s' }}>🧱</span>
                        <span className={styles.floatIcon} style={{ top: '60%', left: '4%', fontSize: '2.5rem', animationDelay: '0.6s' }}>⚙️</span>
                        <span className={styles.floatIcon} style={{ top: '70%', right: '5%', fontSize: '2.8rem', animationDelay: '1.8s' }}>🔩</span>
                        <span className={styles.floatIcon} style={{ top: '40%', left: '2%', fontSize: '2rem', animationDelay: '2.4s' }}>🪵</span>
                        <span className={styles.floatIcon} style={{ top: '50%', right: '3%', fontSize: '2.2rem', animationDelay: '0.9s' }}>🏠</span>
                    </div>
                    <div className={styles.heroContent}>
                        <div className={styles.badge}>🚀 #1 Construction Marketplace</div>
                        <h1 className={styles.heroTitle}>
                            Build Better With
                            <span className={styles.gradientText}> BuildMart</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            The all-in-one platform connecting Suppliers, Customers, and Drivers.
                            <br />Source materials, manage orders, and deliver with ease.
                        </p>
                        <div className={styles.heroStats}>
                            <div className={styles.statItem}>
                                <strong>
                                    <span className={styles.countNum}>{suppliers}</span>+
                                </strong>
                                Suppliers
                            </div>
                            <div className={styles.statDivider}></div>
                            <div className={styles.statItem}>
                                <strong>
                                    <span className={styles.countNum}>{products}</span>k+
                                </strong>
                                Products
                            </div>
                            <div className={styles.statDivider}></div>
                            <div className={styles.statItem}>
                                <strong>
                                    <span className={styles.countNum}>{support}</span>/7
                                </strong>
                                Support
                            </div>
                        </div>
                    </div>
                </section>

                {/* Role Selection */}
                <section className={styles.roleSection}>
                    <div className={styles.howHeader}>
                        <h2 className={styles.sectionTitle}>Choose Your Role</h2>
                        <p className={styles.howSubtitle}>Select how you want to participate and get started in minutes</p>
                    </div>
                    <div className={styles.roleGrid}>
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className={`${styles.roleCard} ${selectedRole === role.id ? styles.roleCardActive : ''}`}
                                onClick={() => setSelectedRole(role.id)}
                                style={{ '--role-gradient': role.color }}
                            >
                                <div className={styles.roleAccentBar} style={{ background: role.color }}></div>
                                <div className={styles.roleFreeIcon}>{role.icon}</div>
                                <h3 className={styles.roleTitle}>{role.title}</h3>
                                <p className={styles.roleDescription}>{role.description}</p>
                                <ul className={styles.roleFeatures}>
                                    {role.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <span className={styles.featureDot}></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={role.link}>
                                    <button
                                        className={styles.roleButton}
                                        style={{ background: role.color }}
                                    >
                                        Get Started as {role.title} →
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className={styles.features}>
                    <div className={styles.howHeader}>
                        <span className={styles.howBadge}>Why BuildMart</span>
                        <h2 className={styles.sectionTitle}>Why Choose BuildMart?</h2>
                        <p className={styles.howSubtitle}>Everything you need to run your construction business — in one place</p>
                    </div>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>⚡</div>
                            </div>
                            <h3>Fast &amp; Reliable</h3>
                            <p>Same-day delivery options with real-time tracking from warehouse to site</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>🔒</div>
                            </div>
                            <h3>Secure Payments</h3>
                            <p>Escrow protection and fully transparent pricing — no hidden fees</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>🎯</div>
                            </div>
                            <h3>Best Prices</h3>
                            <p>Compare multiple suppliers side-by-side and always get the best deal</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>📱</div>
                            </div>
                            <h3>Easy to Use</h3>
                            <p>Simple, intuitive interface designed for speed and ease across all devices</p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className={styles.howItWorks}>
                    <div className={styles.howHeader}>
                        <span className={styles.howBadge}>Simple Process</span>
                        <h2 className={styles.sectionTitle}>How BuildMart Works</h2>
                        <p className={styles.howSubtitle}>Get started in minutes — no complicated setup required</p>
                    </div>
                    <div className={styles.stepsGrid}>
                        <div className={styles.step}>
                            <div className={styles.stepIconWrap}>
                                <div className={styles.stepEmoji}>👤</div>
                                <div className={styles.stepNum}>1</div>
                            </div>
                            <div className={styles.stepConnector}></div>
                            <h3>Create Account</h3>
                            <p>Sign up as a Supplier, Customer, or Driver in under 2 minutes</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIconWrap}>
                                <div className={styles.stepEmoji}>🔍</div>
                                <div className={styles.stepNum}>2</div>
                            </div>
                            <div className={styles.stepConnector}></div>
                            <h3>Browse or List</h3>
                            <p>Customers find the best deals; Suppliers list products instantly</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIconWrap}>
                                <div className={styles.stepEmoji}>📦</div>
                                <div className={styles.stepNum}>3</div>
                            </div>
                            <div className={styles.stepConnector}></div>
                            <h3>Order & Dispatch</h3>
                            <p>Place your order — a nearby driver picks it up immediately</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIconWrap}>
                                <div className={styles.stepEmoji}>✅</div>
                                <div className={styles.stepNum}>4</div>
                            </div>
                            <h3>Delivered & Paid</h3>
                            <p>Confirm delivery and receive secure, instant payment settlement</p>
                        </div>
                    </div>
                </section>
                {/* Contact Section */}
                <section id="contact" className={styles.contactSection}>
                    <div className={styles.howHeader}>
                        <span className={styles.howBadge}>Get in Touch</span>
                        <h2 className={styles.sectionTitle}>We&apos;d Love to Hear From You</h2>
                        <p className={styles.howSubtitle}>Our team is ready to help you 7 days a week</p>
                    </div>
                    <div className={styles.contactGrid}>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>📍</div>
                            </div>
                            <h3>Visit Us</h3>
                            <p>123 Construction Hub,<br />Industrial Area Phase 1,<br />Moodbidre, 574227</p>
                        </div>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>📞</div>
                            </div>
                            <h3>Call Us</h3>
                            <p>+91 7349739766<br />+91 7259827565</p>
                        </div>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji} style={{ background: 'white', color: '#ef4444' }}>
                                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#ef4444" stroke="none"></path>
                                        <path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="2"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3>Email Us</h3>
                            <p>support@buildmart.com<br />sales@buildmart.com</p>
                        </div>
                        <div className={styles.contactCard}>
                            <div className={styles.contactIconWrap}>
                                <div className={styles.contactEmoji}>⏰</div>
                            </div>
                            <h3>Business Hours</h3>
                            <p>Mon – Sun<br />9:00 AM – 8:00 PM</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>

                    {/* Brand Column */}
                    <div className={styles.footerBrand}>
                        <div className={styles.footerLogo}>
                            <span className={styles.footerLogoIcon}>🏗️</span>
                            <span className={styles.footerLogoText}>BuildMart</span>
                        </div>
                        <p className={styles.footerTagline}>
                            Connecting suppliers, customers, and drivers for construction materials.
                            Build smarter, order faster, deliver reliably.
                        </p>
                        <div className={styles.footerSocials}>
                            {/* Facebook */}
                            <a href="#" aria-label="Facebook" className={styles.socialIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>
                            {/* Twitter / X */}
                            <a href="#" aria-label="Twitter" className={styles.socialIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="#" aria-label="LinkedIn" className={styles.socialIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.footerCol}>
                        <h4 className={styles.footerColTitle}>Quick Links</h4>
                        <ul className={styles.footerLinks}>
                            <li><a href="#">Home</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><Link href="/supplier">Supplier Portal</Link></li>
                            <li><Link href="/customer">Browse Materials</Link></li>
                            <li><a href="#contact">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className={styles.footerCol}>
                        <h4 className={styles.footerColTitle}>Contact</h4>
                        <ul className={styles.footerLinks}>
                            <li>
                                <a href="mailto:support@buildmart.com" className={styles.footerContactRow}>
                                    {/* Envelope icon */}
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactSvgIcon}>
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    support@buildmart.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+917349739766" className={styles.footerContactRow}>
                                    {/* Phone icon */}
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactSvgIcon}>
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.38 2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5A16 16 0 0 0 15.5 16.09l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    +91 7349739766
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className={styles.footerBottom}>
                    <p>© 2026 BuildMart. All rights reserved.</p>
                    <p className={styles.footerMadeWith}>Made with ❤️ in India</p>
                </div>
            </footer>
        </div>
    )
}
