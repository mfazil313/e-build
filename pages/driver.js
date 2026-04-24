import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import LoginForm from '../components/LoginForm'
import ConstructionLoader from '../components/ConstructionLoader'
import { formatCurrency } from '../lib/mockData'
import styles from '../styles/Driver.module.css'

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE SVG ICONS
   ═══════════════════════════════════════════════════════════════════════════ */
const I = {
    Wallet: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><path d="M6 14h.01" /></svg>,
    Truck: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    TruckLg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    Star: <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffb547" stroke="#ffb547" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    Pin: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    Clock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Package: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    PackageLg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    Phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    Navigate: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>,
    Check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    CheckCircle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    User: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    UserLg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    Logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    History: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>,
    Close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    ChevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
}

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════════════════════════════════════════════════════ */
function CountdownTimer({ seconds, total = 60 }) {
    const r = 20
    const circ = 2 * Math.PI * r
    const offset = circ - (seconds / total) * circ
    const danger = seconds <= 10

    return (
        <div className={styles.timerWrap}>
            <div className={styles.timerRing}>
                <svg viewBox="0 0 48 48">
                    <circle className={styles.timerBg} cx="24" cy="24" r={r} />
                    <circle
                        className={`${styles.timerFg} ${danger ? styles.timerFgDanger : ''}`}
                        cx="24" cy="24" r={r}
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className={`${styles.timerDigit} ${danger ? styles.timerDigitDanger : ''}`}>{seconds}s</div>
            </div>
            <div className={styles.timerText}>
                <span className={styles.timerTextBold}>Accept within {seconds} seconds</span>
                <span className={styles.timerTextSub}>This job will pass to another driver</span>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAP VIEW COMPONENT — Real Google Maps embed with live GPS
   ═══════════════════════════════════════════════════════════════════════════ */
const RATE_PER_KM = 22 // ₹22 per km

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function MapView({ address, driverPos }) {
    const mapSrc = driverPos
        ? `https://maps.google.com/maps?q=${driverPos.lat},${driverPos.lng}&z=15&output=embed`
        : address
            ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`
            : null

    if (mapSrc) {
        return (
            <div className={styles.mapView} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                <iframe
                    src={mapSrc}
                    width="100%" height="100%"
                    style={{ border: 'none', borderRadius: 'inherit', minHeight: '140px' }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Live Map"
                />
                {driverPos && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                        GPS LIVE · {driverPos.lat.toFixed(4)}, {driverPos.lng.toFixed(4)}
                    </div>
                )}
            </div>
        )
    }

    // Fallback SVG
    return (
        <div className={styles.mapView}>
            <svg className={styles.mapRoutesvg} viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d97e" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#4facfe" stopOpacity="0.9" />
                    </linearGradient>
                </defs>
                <path d="M 40,65 Q 120,30 200,65 Q 290,100 360,65" fill="none" stroke="rgba(79,172,254,0.12)" strokeWidth="12" strokeLinecap="round" />
                <path d="M 40,65 Q 120,30 200,65 Q 290,100 360,65" fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
                <circle cx="40" cy="65" r="7" fill="#00d97e" opacity="0.95" />
                <circle cx="360" cy="65" r="7" fill="#4facfe" opacity="0.95"><animate attributeName="r" values="7;11;7" dur="2s" repeatCount="indefinite" /></circle>
            </svg>
            <div className={styles.mapEta}>{I.Clock} Enable GPS to see live map · {address ? address.slice(0, 22) + '...' : 'In transit'}</div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DriverDashboard() {
    const {
        orders, updateOrderStatus, currentUser, isAuthenticated, authLoading, logout,
        deliveryJobs, claimDeliveryJob, rejectDeliveryJob, deviceId
    } = useApp()

    const [tab, setTab] = useState('available')
    const [isOnline, setIsOnline] = useState(true)
    const [toast, setToast] = useState(null)
    const [modal, setModal] = useState(null)
    const [timers, setTimers] = useState({})
    const timerRefs = useRef({})
    const [activePanel, setActivePanel] = useState(null)
    const [editForm, setEditForm] = useState(null)
    const [profileData, setProfileData] = useState(() => {
        try { return JSON.parse(localStorage.getItem('bm_driver_profile') || 'null') } catch { return null }
    })
    const [vehicleData, setVehicleData] = useState(() => {
        try { return JSON.parse(localStorage.getItem('bm_driver_vehicle') || 'null') } catch { return null }
    })
    // GPS tracking state
    const [driverPos, setDriverPos] = useState(null)  // { lat, lng }
    const [gpsError, setGpsError] = useState(null)
    const [tripKm, setTripKm] = useState({})           // { [orderId]: km }
    const watchIdRef = useRef(null)
    const lastPosRef = useRef(null)                     // for incremental distance

    /* ── Toast helper ──────────────────────────────────────────────────── */
    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    /* ── Timers ────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isOnline) return
        deliveryJobs.forEach(job => {
            if (!timerRefs.current[job.id]) {
                setTimers(prev => ({ ...prev, [job.id]: 60 }))
                timerRefs.current[job.id] = setInterval(() => {
                    setTimers(prev => {
                        const s = (prev[job.id] || 0) - 1
                        if (s <= 0) {
                            clearInterval(timerRefs.current[job.id])
                            delete timerRefs.current[job.id]
                            rejectDeliveryJob(job.id, currentUser?.id || deviceId)
                            const n = { ...prev }; delete n[job.id]; return n
                        }
                        return { ...prev, [job.id]: s }
                    })
                }, 1000)
            }
        })
        Object.keys(timerRefs.current).forEach(id => {
            if (!deliveryJobs.find(j => j.id === id)) {
                clearInterval(timerRefs.current[id])
                delete timerRefs.current[id]
                setTimers(prev => { const n = { ...prev }; delete n[id]; return n })
            }
        })
    }, [deliveryJobs, isOnline])

    useEffect(() => () => Object.values(timerRefs.current).forEach(clearInterval), [])

    /* ── GPS tracking ───────────────────────────────────────────────────── */
    const startGps = () => {
        if (!navigator.geolocation) { setGpsError('GPS not supported on this device'); return }
        if (watchIdRef.current != null) return // already watching
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords
                const newPos = { lat, lng }
                // Accumulate distance for each active order
                if (lastPosRef.current) {
                    const delta = haversineKm(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng)
                    if (delta > 0.02) { // ignore noise < 20m
                        setTripKm(prev => {
                            const updated = { ...prev }
                            // add delta to every active order ID
                            Object.keys(updated).forEach(id => { updated[id] = (updated[id] || 0) + delta })
                            return updated
                        })
                    }
                }
                lastPosRef.current = newPos
                setDriverPos(newPos)
                setGpsError(null)
            },
            (err) => setGpsError(err.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        )
    }
    const stopGps = () => {
        if (watchIdRef.current != null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
    }
    // Start GPS when driver goes online, stop when offline
    useEffect(() => { isOnline ? startGps() : stopGps() }, [isOnline])
    // Cleanup on unmount
    useEffect(() => stopGps, [])

    /* ── Derived ───────────────────────────────────────────────────────── */
    const driverName = profileData?.name || currentUser?.name || 'Driver'
    const driverId = currentUser?.id || deviceId

    const activeOrders = orders.filter(o => (o.driverName === driverName || o.driverId === driverId) && o.status === 'in_transit')
    const deliveredOrders = orders.filter(o => (o.driverName === driverName || o.driverId === driverId) && o.status === 'delivered')

    // Register active order IDs in tripKm tracker once activeOrders is available
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setTripKm(prev => {
            const updated = { ...prev }
            activeOrders.forEach(o => { if (!(o.id in updated)) updated[o.id] = 0 })
            return updated
        })
    }, [activeOrders.length])

    const todayEarnings = deliveredOrders.reduce((s, o) => {
        const d = new Date(o.driverAcceptedAt || o.createdAt)
        return d.toDateString() === new Date().toDateString() ? s + (o.kmCharge || 0) : s
    }, 0)
    const totalEarnings = deliveredOrders.reduce((s, o) => s + (o.kmCharge || 0), 0)
    const earnFor = o => o.kmCharge || 0  // purely km-based, saved at delivery

    /* Dynamic rating: starts at 4.0, +0.04 per delivery (max +0.8), +0.1 speed bonus if avg < 25 min */
    const avgDeliveryMins = deliveredOrders.length > 0
        ? deliveredOrders.reduce((s, o) => {
            if (!o.driverAcceptedAt || !o.deliveredAt) return s + 25
            return s + (new Date(o.deliveredAt) - new Date(o.driverAcceptedAt)) / 60000
        }, 0) / deliveredOrders.length
        : 25
    const dynamicRating = Math.min(5.0, +(4.0 + Math.min(0.8, deliveredOrders.length * 0.04) + (avgDeliveryMins < 25 ? 0.1 : 0) + (avgDeliveryMins < 15 ? 0.1 : 0)).toFixed(1))

    /* Weekly earnings */
    const weekEarnings = deliveredOrders.reduce((s, o) => {
        const d = new Date(o.driverAcceptedAt || o.createdAt)
        const now = new Date(); const weekAgo = new Date(now - 7 * 86400000)
        return d >= weekAgo ? s + (o.kmCharge || 0) : s
    }, 0)

    /* ── Number masking ───────────────────────────────────────────── */
    const maskPhone = (phone) => {
        if (!phone) return null
        const digits = String(phone).replace(/\D/g, '')
        if (digits.length < 7) return '****'
        // Show first 2 then mask middle then last 3 — e.g. 98XXX XXX678
        return digits.slice(0, 2) + 'XXXXX' + digits.slice(-3)
    }

    /* ── Handlers ──────────────────────────────────────────────────────── */
    const accept = (id) => {
        clearInterval(timerRefs.current[id])
        delete timerRefs.current[id]
        setTimers(p => { const n = { ...p }; delete n[id]; return n })
        const driverPhone = profileData?.phone || ''
        claimDeliveryJob(id, driverName, driverPhone)
        setTab('active')
        showToast('Job accepted! Head to pickup location.')
    }

    const markDelivered = (id) => {
        const km = tripKm[id] || 0
        const kmCharge = Math.round(km * RATE_PER_KM)
        updateOrderStatus(id, 'delivered', { kmDistance: +km.toFixed(2), kmCharge })
        showToast(`Delivery completed! Earned ₹${kmCharge} 🎉`)
    }

    const callCustomer = (phone) => {
        if (phone) window.location.href = `tel:${phone}`
        else showToast('Customer phone number unavailable')
    }

    /* ── Profile save ──────────────────────────────────────────────────── */
    const openEditProfile = () => {
        setEditForm({
            name: profileData?.name || currentUser?.name || '',
            phone: profileData?.phone || '',
            bio: profileData?.bio || '',
            avatarColor: profileData?.avatarColor || '#4f46e5',
        })
        setActivePanel('editProfile')
    }
    const saveProfile = () => {
        const updated = { ...profileData, ...editForm }
        setProfileData(updated)
        localStorage.setItem('bm_driver_profile', JSON.stringify(updated))
        setActivePanel(null)
        showToast('Profile updated!')
    }

    /* ── Vehicle save ──────────────────────────────────────────────────── */
    const [vForm, setVForm] = useState(() => vehicleData || { type: 'Tempo', number: '', license: '', model: '' })
    const saveVehicle = () => {
        setVehicleData(vForm)
        localStorage.setItem('bm_driver_vehicle', JSON.stringify(vForm))
        setActivePanel(null)
        showToast('Vehicle details saved!')
    }

    /* ── Auth guards ───────────────────────────────────────────────────── */
    if (authLoading) return <ConstructionLoader message="Loading" />
    if (!isAuthenticated) return <LoginForm role="driver" isOverlay={false} />

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════════ */
    return (
        <div className={styles.container}>

            {/* ── TOAST ──────────────────────────────────────────────────────── */}
            {toast && <div className={styles.toast}>{I.CheckCircle} {toast}</div>}

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <div className={styles.logo}>
                            <div className={styles.logoMark}>🏗️</div>
                            <span className={styles.logoText}>BuildMart</span>
                        </div>
                        <span className={styles.driverChip}>{I.Truck} Driver</span>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.onlineToggleWrap} onClick={() => setIsOnline(p => !p)}>
                            <span className={`${styles.statusLabel} ${isOnline ? styles.statusLabelOnline : ''}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                            <div className={`${styles.togglePill} ${isOnline ? styles.togglePillOnline : ''}`}>
                                <div className={styles.toggleThumb} />
                            </div>
                        </div>
                        <div className={styles.walletBadge}>{I.Wallet} {formatCurrency(Math.round(todayEarnings))}</div>
                        <button className={styles.signOutBtn} onClick={logout}>
                            {I.Logout} <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MAIN ───────────────────────────────────────────────────────── */}
            <main className={styles.main}>

                {/* Hero earnings card */}
                <div className={styles.heroEarnings}>
                    <p className={styles.heroEarningsLabel}>Today&apos;s Earnings</p>
                    <div className={styles.heroEarningsAmount}>
                        <span>₹</span>{(Math.round(todayEarnings)).toLocaleString('en-IN')}
                    </div>
                </div>

                {/* Stat pills */}
                <div className={styles.heroStatRow}>
                    <div className={styles.statPill}>
                        <div className={`${styles.statPillIcon} ${styles.statPillIconBlue}`}>{I.Package}</div>
                        <span className={styles.statPillValue}>{deliveredOrders.length}</span>
                        <span className={styles.statPillLabel}>Trips Done</span>
                    </div>
                    <div className={styles.statPill}>
                        <div className={`${styles.statPillIcon} ${styles.statPillIconGreen}`}>{I.Truck}</div>
                        <span className={styles.statPillValue}>{activeOrders.length}</span>
                        <span className={styles.statPillLabel}>In Transit</span>
                    </div>
                    <div className={styles.statPill}>
                        <div className={`${styles.statPillIcon} ${styles.statPillIconAmber}`}>{I.Star}</div>
                        <span className={styles.statPillValue}>4.9</span>
                        <span className={styles.statPillLabel}>Rating</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabBar}>
                    {[
                        { id: 'available', label: 'Jobs', icon: I.PackageLg, count: isOnline ? deliveryJobs.length : 0 },
                        { id: 'active', label: 'Active', icon: I.TruckLg, count: activeOrders.length },
                        { id: 'history', label: 'History', icon: I.History, count: null },
                        { id: 'profile', label: 'Profile', icon: I.UserLg, count: null },
                    ].map(t => (
                        <button key={t.id}
                            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
                            onClick={() => setTab(t.id)}
                        >
                            {t.icon} {t.label}
                            {t.count !== null && t.count > 0 && <span className={styles.tabBadge}>{t.count}</span>}
                        </button>
                    ))}
                </div>

                {/* ── CONTENT ─────────────────────────────────────────────────── */}
                <div className={styles.contentArea}>

                    {/* ─── AVAILABLE JOBS ───────────────────────────────────────── */}
                    {tab === 'available' && (
                        <div className={styles.jobsFeed}>
                            {!isOnline ? (
                                <div className={styles.emptyPane}>
                                    <div className={styles.emptyRing}>{I.TruckLg}</div>
                                    <p className={styles.emptyTitle}>You&apos;re Offline</p>
                                    <p className={styles.emptySub}>Toggle online from the header to start receiving high-paying delivery jobs</p>
                                </div>
                            ) : deliveryJobs.length === 0 ? (
                                <div className={styles.emptyPane}>
                                    <div className={styles.emptyRing}>{I.PackageLg}</div>
                                    <p className={styles.emptyTitle}>No Jobs Right Now</p>
                                    <p className={styles.emptySub}>New delivery requests will appear here instantly as suppliers confirm orders</p>
                                </div>
                            ) : deliveryJobs.map(order => (
                                <div key={order.id} className={styles.jobCard}>
                                    <div className={styles.jobCardTop}>
                                        <div className={styles.jobEarning}>
                                            ₹{earnFor(order).toLocaleString('en-IN')}
                                            <small>estimated</small>
                                        </div>
                                        <div className={styles.jobTags}>
                                            <span className={`${styles.jobTag} ${styles.tagBlue}`}>{I.Pin} 4.2 km</span>
                                            <span className={`${styles.jobTag} ${styles.tagGreen}`}>{I.Clock} 20 min</span>
                                        </div>
                                    </div>

                                    <div className={styles.jobCardBody}>
                                        <div className={styles.routeTrack}>
                                            <div className={styles.routeStop}>
                                                <div className={`${styles.routeStopDot} ${styles.dotGreen}`} />
                                                <div className={styles.routeStopInfo}>
                                                    <div className={styles.routeStopType}>Pickup · Supplier Warehouse</div>
                                                    <div className={styles.routeStopAddr}>
                                                        {order.items?.[0]?.name || 'Construction Materials'}
                                                        {(order.items?.length || 0) > 1 && ` +${order.items.length - 1} more`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.routeStop}>
                                                <div className={`${styles.routeStopDot} ${styles.dotRed}`} />
                                                <div className={styles.routeStopInfo}>
                                                    <div className={styles.routeStopType}>Drop-off · Customer</div>
                                                    <div className={styles.routeStopAddr}>{order.deliveryAddress || 'Address pending'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {order.items?.length > 0 && (
                                            <div className={styles.jobChips}>
                                                {order.items.slice(0, 4).map((item, i) => (
                                                    <span key={i} className={styles.chip}>{item.name} ×{item.quantity || 1}</span>
                                                ))}
                                                {order.items.length > 4 && <span className={styles.chip}>+{order.items.length - 4} more</span>}
                                            </div>
                                        )}

                                        <CountdownTimer seconds={timers[order.id] || 0} />
                                        <button className={styles.btnAccept} onClick={() => accept(order.id)}>
                                            {I.Check} Accept Delivery — ₹{RATE_PER_KM}/km
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ─── ACTIVE DELIVERY ──────────────────────────────────────── */}
                    {tab === 'active' && (
                        <div className={styles.jobsFeed}>
                            {activeOrders.length === 0 ? (
                                <div className={styles.emptyPane}>
                                    <div className={styles.emptyRing}>{I.TruckLg}</div>
                                    <p className={styles.emptyTitle}>No Active Deliveries</p>
                                    <p className={styles.emptySub}>Accept a job from the Jobs tab to start a delivery</p>
                                </div>
                            ) : activeOrders.map(order => (
                                <div key={order.id} className={styles.activeCard}>
                                    {/* Card header */}
                                    <div className={styles.activeCardHeader}>
                                        <div className={styles.activeHeaderLeft}>
                                            <div className={styles.activePulse} />
                                            <div>
                                                <div className={styles.activeOrderLabel}>Active Delivery</div>
                                                <div className={styles.activeOrderId}>Order #{order.id}</div>
                                            </div>
                                        </div>
                                        <div className={styles.activeBadge}>{I.Truck} IN TRANSIT</div>
                                    </div>

                                    {/* Route map — real Google Maps with live GPS */}
                                    <MapView address={order.deliveryAddress} driverPos={driverPos} />

                                    {/* GPS + Distance + Fare widget */}
                                    <div className={styles.fareWidget}>
                                        <div className={styles.fareWidgetCol}>
                                            <span className={styles.fareWidgetLabel}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                GPS
                                            </span>
                                            <span className={styles.fareWidgetValue} style={{ color: driverPos ? '#22c55e' : '#ef4444', fontSize: '0.72rem', fontWeight: 800 }}>
                                                {driverPos ? 'LIVE ●' : gpsError ? 'Off' : 'Acquiring...'}
                                            </span>
                                        </div>
                                        <div className={styles.fareWidgetDivider} />
                                        <div className={styles.fareWidgetCol}>
                                            <span className={styles.fareWidgetLabel}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                Distance
                                            </span>
                                            <span className={styles.fareWidgetValue}>{((tripKm[order.id] || 0)).toFixed(2)} km</span>
                                        </div>
                                        <div className={styles.fareWidgetDivider} />
                                        <div className={styles.fareWidgetCol}>
                                            <span className={styles.fareWidgetLabel}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                                KM Charge
                                            </span>
                                            <span className={styles.fareWidgetValue} style={{ color: 'var(--emerald-d)' }}>₹{Math.round((tripKm[order.id] || 0) * RATE_PER_KM)}</span>
                                        </div>
                                        <div className={styles.fareWidgetDivider} />
                                        <div className={styles.fareWidgetCol}>
                                            <span className={styles.fareWidgetLabel}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><path d="M6 14h.01" /></svg>
                                                Your Earnings
                                            </span>
                                            <span className={styles.fareWidgetValue} style={{ color: 'var(--primary)', fontWeight: 900 }}>₹{Math.round((tripKm[order.id] || 0) * RATE_PER_KM)}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-4)', marginBottom: '0.5rem' }}>₹{RATE_PER_KM}/km · Rate updates live as you move</div>

                                    {/* Timeline */}
                                    <div className={styles.timeline}>
                                        <div className={`${styles.tlStep} ${styles.tlStepDone}`}>
                                            <div className={styles.tlDot}>{I.Check}</div>
                                            <span className={styles.tlLabel}>Picked Up</span>
                                        </div>
                                        <div className={`${styles.tlLine} ${styles.tlLineDone}`} />
                                        <div className={`${styles.tlStep} ${styles.tlStepActive}`}>
                                            <div className={styles.tlDot}>{I.Truck}</div>
                                            <span className={styles.tlLabel}>In Transit</span>
                                        </div>
                                        <div className={styles.tlLine} />
                                        <div className={styles.tlStep}>
                                            <div className={styles.tlDot}>{I.Pin}</div>
                                            <span className={styles.tlLabel}>Delivered</span>
                                        </div>
                                    </div>

                                    {/* Info grid */}
                                    <div className={styles.activeInfoGrid}>
                                        <div className={styles.activeInfoCell}>
                                            <div className={styles.aiLabel}>Customer</div>
                                            <div className={styles.aiValue}>{order.customerName || 'Customer'}</div>
                                        </div>
                                        <div className={styles.activeInfoCell}>
                                            <div className={styles.aiLabel}>KM Earnings</div>
                                            <div className={`${styles.aiValue} ${styles.aiValueSuccess}`}>₹{Math.round((tripKm[order.id] || 0) * RATE_PER_KM)} ({(tripKm[order.id] || 0).toFixed(1)} km)</div>
                                        </div>
                                        <div className={styles.activeInfoCell}>
                                            <div className={styles.aiLabel}>Delivery Address</div>
                                            <div className={styles.aiValue}>{order.deliveryAddress || 'Not specified'}</div>
                                        </div>
                                        <div className={styles.activeInfoCell}>
                                            <div className={styles.aiLabel}>Customer Phone
                                                <span style={{ marginLeft: 4, fontSize: '0.58rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>🔒 masked</span>
                                            </div>
                                            <div className={styles.aiValue} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                                                {maskPhone(order.customerPhone) || 'Not provided'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className={styles.activeActions}>
                                        <button className={styles.btnCall} onClick={() => callCustomer(order.customerPhone)}
                                            title={order.customerPhone ? `Call: ${maskPhone(order.customerPhone)}` : 'No number'}>
                                            {I.Phone} {maskPhone(order.customerPhone) || 'Call'}
                                        </button>
                                        <button className={styles.btnNavMap} onClick={() => {
                                            const dest = order.deliveryAddress || ''
                                            const origin = driverPos ? `${driverPos.lat},${driverPos.lng}` : ''
                                            const url = origin
                                                ? `https://www.google.com/maps/dir/${origin}/${encodeURIComponent(dest)}`
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`
                                            window.open(url, '_blank')
                                        }}>
                                            {I.Navigate} Navigate
                                        </button>
                                        <button className={styles.btnDelivered} onClick={() => markDelivered(order.id)}>
                                            {I.Check} Mark Delivered
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ─── HISTORY ──────────────────────────────────────────────── */}
                    {tab === 'history' && (
                        <div>
                            {deliveredOrders.length > 0 && (
                                <div className={styles.historyHeader}>
                                    <div className={styles.historyStatCard}>
                                        <span className={styles.historyStatValue}>{formatCurrency(Math.round(totalEarnings))}</span>
                                        <span className={styles.historyStatLabel}>Total Earned</span>
                                    </div>
                                    <div className={styles.historyStatCard}>
                                        <span className={styles.historyStatValue}>{deliveredOrders.length} trips</span>
                                        <span className={styles.historyStatLabel}>Completed</span>
                                    </div>
                                </div>
                            )}
                            <div className={styles.historyFeed}>
                                {deliveredOrders.length === 0 ? (
                                    <div className={styles.emptyPane}>
                                        <div className={styles.emptyRing}>{I.History}</div>
                                        <p className={styles.emptyTitle}>No Deliveries Yet</p>
                                        <p className={styles.emptySub}>Your completed trip history and earnings will show here</p>
                                    </div>
                                ) : deliveredOrders.map(order => (
                                    <div key={order.id} className={styles.historyItem} onClick={() => setModal(order)}>
                                        <div className={styles.historyItemLeft}>
                                            <div className={styles.historyItemMark}>{I.CheckCircle}</div>
                                            <div className={styles.historyItemInfo}>
                                                <div className={styles.historyItemId}>Order #{order.id}</div>
                                                <div className={styles.historyItemAddr}>{order.deliveryAddress || 'N/A'}</div>
                                                <div className={styles.historyItemDate}>
                                                    {order.driverAcceptedAt
                                                        ? new Date(order.driverAcceptedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : 'Recent'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.historyItemRight}>
                                            <span className={styles.historyItemAmount}>{formatCurrency(earnFor(order))}</span>
                                            <span className={styles.chevronIcon}>{I.ChevronRight}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── PROFILE ──────────────────────────────────────────────── */}
                    {tab === 'profile' && (
                        <div className={styles.profileSection}>
                            <div className={styles.profileHero}>
                                <div className={styles.profileAvatar} style={{ background: profileData?.avatarColor || 'linear-gradient(135deg,#4f46e5,#818cf8)' }}>
                                    {driverName[0]?.toUpperCase() || 'D'}
                                </div>
                                <div className={styles.profileInfo}>
                                    <div className={styles.profileName}>{driverName}</div>
                                    <div className={styles.profileEmail}>{profileData?.phone ? `📞 ${profileData.phone}` : currentUser?.email || ''}</div>
                                    {profileData?.bio && <div className={styles.profileBio}>{profileData.bio}</div>}
                                    <span className={styles.profileRolePill}>{I.Truck} Verified Driver</span>
                                </div>
                                <button className={styles.editAvatarBtn} onClick={openEditProfile}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    Edit
                                </button>
                            </div>

                            <div className={styles.profileStatGrid}>
                                <div className={styles.profileStatTile}>
                                    <span className={styles.profileStatTileValue}>{deliveredOrders.length}</span>
                                    <span className={styles.profileStatTileLabel}>Deliveries</span>
                                </div>
                                <div className={styles.profileStatTile}>
                                    <span className={styles.profileStatTileValue}>{dynamicRating} ⭐</span>
                                    <span className={styles.profileStatTileLabel}>Rating</span>
                                </div>
                                <div className={styles.profileStatTile}>
                                    <span className={styles.profileStatTileValue}>{formatCurrency(Math.round(totalEarnings))}</span>
                                    <span className={styles.profileStatTileLabel}>Earned</span>
                                </div>
                            </div>

                            {/* Rating explanation */}
                            <div className={styles.ratingBar}>
                                <div className={styles.ratingBarHeader}>
                                    <span className={styles.ratingBarTitle}>Your Performance Score</span>
                                    <span className={styles.ratingBarValue}>{dynamicRating} / 5.0</span>
                                </div>
                                <div className={styles.ratingTrack}>
                                    <div className={styles.ratingFill} style={{ width: `${(dynamicRating / 5) * 100}%` }} />
                                </div>
                                <div className={styles.ratingHints}>
                                    <span>{deliveredOrders.length} deliveries completed</span>
                                    <span>Avg {Math.round(avgDeliveryMins)} min/delivery</span>
                                </div>
                            </div>

                            <div className={styles.profileMenuCard}>
                                {[
                                    { icon: <div className={`${styles.profileMenuItemIcon} ${styles.menuIconPurple}`}>{I.User}</div>, label: 'Edit Profile', action: openEditProfile },
                                    { icon: <div className={`${styles.profileMenuItemIcon} ${styles.menuIconBlue}`}>{I.Truck}</div>, label: 'Vehicle & Documents', action: () => { setVForm(vehicleData || { type: 'Tempo', number: '', license: '', model: '' }); setActivePanel('vehicle') } },
                                    { icon: <div className={`${styles.profileMenuItemIcon} ${styles.menuIconAmber}`}>{I.Wallet}</div>, label: 'Earnings & Payouts', action: () => setActivePanel('earnings') },
                                    { icon: <div className={`${styles.profileMenuItemIcon} ${styles.menuIconGreen}`}>{I.Phone}</div>, label: 'Help & Support', action: () => setActivePanel('help') },
                                    { icon: <div className={`${styles.profileMenuItemIcon} ${styles.menuIconRed}`}>{I.Logout}</div>, label: 'Sign Out', danger: true, action: logout },
                                ].map((item, i) => (
                                    <button key={i} className={`${styles.profileMenuItem} ${item.danger ? styles.menuItemDanger : ''}`} onClick={item.action}>
                                        {item.icon}
                                        <span className={styles.profileMenuItemLabel}>{item.label}</span>
                                        {!item.danger && <span className={styles.profileMenuItemArrow}>{I.ChevronRight}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── BOTTOM NAV ────────────────────────────────────────────────── */}
            <nav className={styles.bottomNav}>
                {[
                    { id: 'available', label: 'Jobs', icon: I.Home },
                    { id: 'active', label: 'Active', icon: I.TruckLg },
                    { id: 'history', label: 'History', icon: I.History },
                    { id: 'profile', label: 'Profile', icon: I.UserLg },
                ].map(t => (
                    <button key={t.id}
                        className={`${styles.navBtn} ${tab === t.id ? styles.navBtnActive : ''}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.icon}
                        <span className={styles.navBtnLabel}>{t.label}</span>
                    </button>
                ))}
            </nav>

            {/* ── HISTORY MODAL ─────────────────────────────────────────────── */}
            {modal && (
                <div className={styles.modalBg} onClick={() => setModal(null)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHandle} />
                        <div className={styles.modalTopBar}>
                            <div>
                                <div className={styles.modalTitle}>Order #{modal.id}</div>
                                <div className={styles.modalSubtitle}>Delivered {modal.driverAcceptedAt ? new Date(modal.driverAcceptedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                            </div>
                            <button className={styles.modalCloseBtn} onClick={() => setModal(null)}>{I.Close}</button>
                        </div>
                        <div className={styles.modalEarningsBlock}>
                            <div className={styles.modalEarningsLabel}>Your Earnings</div>
                            <div className={styles.modalEarningsValue}>{formatCurrency(earnFor(modal))}</div>
                        </div>
                        <div className={styles.modalRows}>
                            {[{ k: 'Customer', v: modal.customerName || 'N/A' }, { k: 'Address', v: modal.deliveryAddress || 'N/A' }, { k: 'Items', v: modal.items?.map(i => `${i.name} ×${i.quantity || 1}`).join(', ') || 'N/A' }, { k: 'Order Total', v: formatCurrency(modal.totalAmount || 0) }, { k: 'Your Cut (8%)', v: formatCurrency(earnFor(modal)) }, { k: 'Status', v: '✅ Completed' }].map((row, i) => (
                                <div key={i} className={styles.modalRow}><span className={styles.modalRowKey}>{row.k}</span><span className={styles.modalRowVal}>{row.v}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDIT PROFILE PANEL ──────────────────────────────────────────── */}
            {activePanel === 'editProfile' && (
                <div className={styles.modalBg} onClick={() => setActivePanel(null)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHandle} />
                        <div className={styles.modalTopBar}>
                            <div className={styles.modalTitle}>Edit Profile</div>
                            <button className={styles.modalCloseBtn} onClick={() => setActivePanel(null)}>{I.Close}</button>
                        </div>
                        <div className={styles.panelBody}>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Display Name</label><input className={styles.formInput} value={editForm?.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" /></div>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Phone Number</label><input className={styles.formInput} value={editForm?.phone || ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99999 00000" type="tel" /></div>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Short Bio</label><textarea className={styles.formInput} style={{ resize: 'none', height: '70px' }} value={editForm?.bio || ''} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Professional driver since 2020..." /></div>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Avatar Color</label>
                                <div className={styles.colorPicker}>
                                    {['#4f46e5', '#059669', '#d97706', '#e11d48', '#0891b2', '#7c3aed'].map(c => (
                                        <div key={c} className={`${styles.colorSwatch} ${editForm?.avatarColor === c ? styles.colorSwatchActive : ''}`} style={{ background: c }} onClick={() => setEditForm(p => ({ ...p, avatarColor: c }))} />
                                    ))}
                                </div>
                            </div>
                            <button className={styles.btnSave} onClick={saveProfile}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── VEHICLE & DOCUMENTS PANEL ───────────────────────────────────── */}
            {activePanel === 'vehicle' && (
                <div className={styles.modalBg} onClick={() => setActivePanel(null)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHandle} />
                        <div className={styles.modalTopBar}>
                            <div className={styles.modalTitle}>Vehicle & Documents</div>
                            <button className={styles.modalCloseBtn} onClick={() => setActivePanel(null)}>{I.Close}</button>
                        </div>
                        <div className={styles.panelBody}>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Vehicle Type</label>
                                <select className={styles.formInput} value={vForm.type} onChange={e => setVForm(p => ({ ...p, type: e.target.value }))}>
                                    {['Tempo', 'Mini Truck', 'Pickup', 'Tata Ace', 'Two-Wheeler'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Vehicle Model</label><input className={styles.formInput} value={vForm.model} onChange={e => setVForm(p => ({ ...p, model: e.target.value }))} placeholder="e.g. Tata Ace Gold" /></div>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Vehicle Number</label><input className={styles.formInput} value={vForm.number} onChange={e => setVForm(p => ({ ...p, number: e.target.value.toUpperCase() }))} placeholder="MH 12 AB 1234" /></div>
                            <div className={styles.formGroup}><label className={styles.formLabel}>Driving License No.</label><input className={styles.formInput} value={vForm.license} onChange={e => setVForm(p => ({ ...p, license: e.target.value.toUpperCase() }))} placeholder="MH0120230001234" /></div>
                            {vehicleData && <div className={styles.savedBadge}>✅ Details on file — {vehicleData.type} · {vehicleData.number}</div>}
                            <button className={styles.btnSave} onClick={saveVehicle}>Save Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EARNINGS & PAYOUTS PANEL ────────────────────────────────────── */}
            {activePanel === 'earnings' && (
                <div className={styles.modalBg} onClick={() => setActivePanel(null)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHandle} />
                        <div className={styles.modalTopBar}>
                            <div className={styles.modalTitle}>Earnings & Payouts</div>
                            <button className={styles.modalCloseBtn} onClick={() => setActivePanel(null)}>{I.Close}</button>
                        </div>
                        <div className={styles.modalEarningsBlock}>
                            <div className={styles.modalEarningsLabel}>Total Lifetime Earnings</div>
                            <div className={styles.modalEarningsValue}>{formatCurrency(Math.round(totalEarnings))}</div>
                        </div>
                        <div className={styles.panelBody}>
                            <div className={styles.earningsSummaryGrid}>
                                <div className={styles.earningsSummaryCard}><span className={styles.earningsSummaryVal}>{formatCurrency(Math.round(todayEarnings))}</span><span className={styles.earningsSummaryLabel}>Today</span></div>
                                <div className={styles.earningsSummaryCard}><span className={styles.earningsSummaryVal}>{formatCurrency(Math.round(weekEarnings))}</span><span className={styles.earningsSummaryLabel}>This Week</span></div>
                                <div className={styles.earningsSummaryCard}><span className={styles.earningsSummaryVal}>{deliveredOrders.length}</span><span className={styles.earningsSummaryLabel}>Total Trips</span></div>
                                <div className={styles.earningsSummaryCard}><span className={styles.earningsSummaryVal}>{deliveredOrders.length > 0 ? formatCurrency(Math.round(totalEarnings / deliveredOrders.length)) : '₹0'}</span><span className={styles.earningsSummaryLabel}>Avg / Trip</span></div>
                            </div>
                            <div className={styles.payoutInfo}>
                                <div className={styles.payoutInfoRow}><span>Commission Rate</span><span className={styles.payoutInfoVal}>8% of order value</span></div>
                                <div className={styles.payoutInfoRow}><span>Payout Cycle</span><span className={styles.payoutInfoVal}>Every Monday</span></div>
                                <div className={styles.payoutInfoRow}><span>Payment Method</span><span className={styles.payoutInfoVal}>Bank Transfer / UPI</span></div>
                                <div className={styles.payoutInfoRow}><span>Next Payout</span><span className={styles.payoutInfoVal} style={{ color: 'var(--emerald)' }}>Processing...</span></div>
                            </div>
                            <div className={styles.recentDeliveriesTitle}>Recent Deliveries</div>
                            {deliveredOrders.length === 0 ? <p style={{ color: 'var(--text-4)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No deliveries yet</p> :
                                deliveredOrders.slice(0, 5).map(o => (
                                    <div key={o.id} className={styles.miniDeliveryRow}>
                                        <span className={styles.miniOrderId}>#{o.id}</span>
                                        <span className={styles.miniOrderAddr}>{o.deliveryAddress?.slice(0, 22) || 'N/A'}...</span>
                                        <span className={styles.miniOrderAmt}>{formatCurrency(earnFor(o))}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* ── HELP & SUPPORT PANEL ────────────────────────────────────────── */}
            {activePanel === 'help' && (
                <div className={styles.modalBg} onClick={() => setActivePanel(null)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                        <div className={styles.modalHandle} />
                        <div className={styles.modalTopBar}>
                            <div className={styles.modalTitle}>Help & Support</div>
                            <button className={styles.modalCloseBtn} onClick={() => setActivePanel(null)}>{I.Close}</button>
                        </div>
                        <div className={styles.panelBody}>
                            <div className={styles.supportCallCard}>
                                <div>
                                    <div className={styles.supportCallTitle}>Driver Support Helpline</div>
                                    <div className={styles.supportCallSub}>Available 24 × 7 · Free</div>
                                </div>
                                <button className={styles.supportCallBtn} onClick={() => window.location.href = 'tel:18001234567'}>{I.Phone} Call Now</button>
                            </div>
                            <div className={styles.faqTitle}>Frequently Asked Questions</div>
                            {[
                                { q: 'How is my earnings calculated?', a: 'You earn 8% of the order value for each delivery you complete. Payouts are processed every Monday directly to your registered bank account or UPI ID.' },
                                { q: 'How is my rating calculated?', a: 'Your rating starts at 4.0 and increases with each completed delivery (+0.04 per delivery). Faster deliveries (under 25 min avg) earn a speed bonus of up to +0.2.' },
                                { q: 'What happens if I reject too many jobs?', a: 'Jobs auto-expire after 60 seconds. Frequent rejections may temporarily reduce the number of jobs shown to you. Stay online and accept promptly for best results.' },
                                { q: 'How do I update my vehicle documents?', a: "Go to Profile → Vehicle & Documents to enter or update your vehicle number, model, and driving license. Ensure details are accurate for verification." },
                                { q: 'What is the delivery time window?', a: 'Deliveries should be completed within 2 hours of acceptance. Faster deliveries improve your rating and increase your chances of getting premium orders.' },
                                { q: 'How do I contact the customer?', a: "Once you accept a job, you'll see a 'Call' button on the Active tab. Tap it to call the customer directly from your device." },
                                { q: 'When will I receive my payout?', a: 'Payouts are credited every Monday for the previous week\'s earnings. You will receive a notification once the transfer is initiated.' },
                            ].map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false)
    return (
        <div style={{ borderBottom: '1px solid #e4e9f5', paddingBottom: '0.1rem' }}>
            <button onClick={() => setOpen(p => !p)} style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.87rem', fontWeight: 700, color: '#0f172a' }}>{q}</span>
                <span style={{ fontSize: '1.2rem', color: '#6b7280', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
            </button>
            {open && <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.65, paddingBottom: '0.9rem', margin: 0 }}>{a}</p>}
        </div>
    )
}
