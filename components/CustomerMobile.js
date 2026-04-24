import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { storage, ID } from '../lib/appwrite'
import { useApp } from '../context/AppContext'
import LoginForm from '../components/LoginForm'
import ConstructionLoader from '../components/ConstructionLoader'
import styles from '../styles/CustomerMobile.module.css'

/* ═══════════════════════════════════════════════════════════════════════════════
   SVG ICONS — all inline, no external deps
   ═══════════════════════════════════════════════════════════════════════════════ */
const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>)
const CartSvg = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>)
const ChevronDown = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>)
const StarIcon = ({ filled }) => (<svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)
const CompareIcon = ({ active }) => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="9" height="18" rx="1" /><rect x="13" y="3" width="9" height="18" rx="1" /><line x1="7" y1="8" x2="7" y2="8.01" /><line x1="18" y1="8" x2="18" y2="8.01" /></svg>)
const ShareIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>)
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>)
const CloseIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>)
const LocationIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>)
const TruckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>)
const BoxIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>)
const LogoutIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>)
const GridIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>)
const ListIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>)
const HeartIcon = ({ active, color }) => (<svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#dc2626' : 'none'} stroke={active ? '#dc2626' : (color || '#94a3b8')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>)
const CompareDrawerIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="9" height="18" rx="1" /><rect x="13" y="3" width="9" height="18" rx="1" /></svg>)
// Big check for order success
const BigCheckSvg = () => (<svg width="56" height="56" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" /><polyline points="8 12 11 15 16 9" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>)
const CartAddSvg = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" /><circle cx="9" cy="18" r="1" fill="#2563eb" /><circle cx="16" cy="18" r="1" fill="#2563eb" /><path d="M4 4h2l2.5 9h7.5l2-5H8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><line x1="18" y1="3" x2="18" y2="7" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" /><line x1="16" y1="5" x2="20" y2="5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" /></svg>)
const WishlistAddSvg = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" /><path d="M16.5 8.5a3 3 0 0 0-4.24 0L12 8.75l-.26-.25a3 3 0 0 0-4.24 4.24l.26.26L12 17.25l4.24-4.25.26-.26a3 3 0 0 0 0-4.24z" fill="#fecaca" stroke="#dc2626" strokeWidth="1.2" /></svg>)
const WarningSvg = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" /><line x1="12" y1="8" x2="12" y2="13" stroke="#d97706" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="#d97706" /></svg>)
const InfoSvg = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" /><circle cx="12" cy="8" r="1" fill="#2563eb" /><line x1="12" y1="11" x2="12" y2="16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" /></svg>)
const ShareDoneSvg = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" /><path d="M8 12l2.5 2.5L16 9" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>)

/* ═══════════════════════════════════════════════════════════════════════════════
   Popup / Notification system
   - Rich mini-popup with SVG icon, title, subtitle, auto-dismiss + progress bar
   ═══════════════════════════════════════════════════════════════════════════════ */
const POPUP_ICONS = {
    cart: <CartAddSvg />,
    order: <BigCheckSvg />,
    wishlist: <WishlistAddSvg />,
    warning: <WarningSvg />,
    info: <InfoSvg />,
    share: <ShareDoneSvg />,
    error: <WarningSvg />,
}

function NotificationPopups({ popups, removePopup }) {
    return (
        <div className={styles.popupContainer}>
            {popups.map(p => (
                <div key={p.id} className={`${styles.popup} ${styles[`popup_${p.type}`] || ''}`}>
                    <div className={styles.popupIcon}>{POPUP_ICONS[p.type] || POPUP_ICONS.info}</div>
                    <div className={styles.popupContent}>
                        <p className={styles.popupTitle}>{p.title}</p>
                        {p.subtitle && <p className={styles.popupSub}>{p.subtitle}</p>}
                        {p.action && (
                            <button className={styles.popupAction} onClick={() => { p.action.onClick(); removePopup(p.id) }}>
                                {p.action.label}
                            </button>
                        )}
                    </div>
                    <button className={styles.popupClose} onClick={() => removePopup(p.id)}><CloseIcon /></button>
                    <div className={styles.popupProgress} style={{ animationDuration: `${p.duration || 3500}ms` }} />
                </div>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ORDER SUCCESS MODAL  — full-screen confirmation after placing an order
   ═══════════════════════════════════════════════════════════════════════════════ */
function OrderSuccessModal({ order, onClose, onViewOrders }) {
    if (!order) return null
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.orderSuccessModal} onClick={e => e.stopPropagation()}>
                <div className={styles.successAnim}><BigCheckSvg /></div>
                <h2 className={styles.successTitle}>Order Placed!</h2>
                <p className={styles.successSub}>Your order has been confirmed and the supplier has been notified.</p>
                <div className={styles.successDetails}>
                    <div className={styles.successRow}><span>Order ID</span><span className={styles.mono}>{order.id}</span></div>
                    <div className={styles.successRow}><span>Items</span><span>{order.items?.length || 0} product{order.items?.length !== 1 ? 's' : ''}</span></div>
                    <div className={styles.successRow}><span>Total</span><span className={styles.successTotal}>{formatCurrency(order.totalAmount * 1.18)}</span></div>
                    <div className={styles.successRow}><span>Delivery</span><span>{order.deliveryMethod === 'tempo' ? 'Tempo · Same Day' : 'Self Pickup'}</span></div>
                    <div className={styles.successRow}><span>Payment</span><span>{order.paymentMethod === 'upi' ? 'UPI / Net Banking' : 'Pay on Delivery'}</span></div>
                    {order.deliveryAddress && <div className={styles.successRow}><span>Address</span><span>{order.deliveryAddress}</span></div>}
                </div>
                <div className={styles.successActions}>
                    <button className={styles.btnPrimary} onClick={onViewOrders}>View My Orders</button>
                    <button className={styles.btnOutline} onClick={onClose}>Continue Shopping</button>
                </div>
            </div>
        </div>
    )
}

/* Product illustration fallback */
function ProductIllustration({ category }) {
    const colors = { Cement: '#d4a373', Bricks: '#e07a5f', Sand: '#e9c46a', Steel: '#60a5fa', Tools: '#6b7280' }
    const c = colors[category] || '#60a5fa'
    return (<svg width="64" height="64" viewBox="0 0 24 24" fill={c} stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" strokeLinejoin="round" opacity="0.9"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>)
}

/* Category filter icons */
const catIcons = {
    Cement: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e07a5f" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="8" y1="6" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="18" /></svg>,
    Bricks: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e27c3e" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="10" y1="4" x2="10" y2="12" /><line x1="14" y1="12" x2="14" y2="20" /></svg>,
    Sand: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M12 2L2 22h20L12 2z" /></svg>,
    Steel: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><line x1="4" y1="21" x2="20" y2="21" /><path d="M7 21V9" /><path d="M17 21v-4" /><path d="M3 9l18 0" /><path d="M9 4l6 0" /><path d="M12 4L12 9" /></svg>,
    Tools: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
}

/* Auto-fetch image for cart items without one */
function CartItemImage({ item }) {
    const [src, setSrc] = useState(
        item.image && typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('data:'))
            ? item.image : null
    )
    const [tried, setTried] = useState(false)
    useEffect(() => {
        if (src || tried) return
        setTried(true)
        fetch(`/api/searchImage?q=${encodeURIComponent(item.name + ' construction material product')}`)
            .then(r => r.json())
            .then(d => { if (d.url) setSrc(d.url) })
            .catch(() => { })
    }, [item.name, src, tried])
    return (
        <div className={styles.cartItemImage}>
            {src ? <img src={src} alt={item.name} onError={() => setSrc(null)} /> : <ProductIllustration category={item.category} />}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function CustomerInterface() {
    const router = useRouter()
    const {
        isAuthenticated, currentUser, authLoading, logout,
        products, fetchProducts,
        cart, addToCart: ctxAddToCart, removeFromCart: ctxRemoveFromCart,
        updateCartQuantity: ctxUpdateQty, clearCart: ctxClearCart,
        orders, createOrder,
    } = useApp()

    // ── UI State ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('browse')
    // Read ?tab= from URL (e.g. /customer?tab=cart)
    useEffect(() => {
        if (router.query.tab) setActiveTab(router.query.tab)
    }, [router.query.tab])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('default')
    const [isSortOpen, setIsSortOpen] = useState(false)
    const sortRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setIsSortOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    const [viewMode, setViewMode] = useState('grid')
    const [showProfile, setShowProfile] = useState(false)
    const profileRef = useRef(null)

    // Checkout form state
    const [selectedAddress, setSelectedAddress] = useState('')
    const [savedAddresses, setSavedAddresses] = useState([]) // Loaded from customer DB later
    const [selectedPayment, setSelectedPayment] = useState('cod')
    const [deliveryMethod, setDeliveryMethod] = useState('tempo')
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [expandedOrders, setExpandedOrders] = useState({})

    // Profile settings state
    const [settingsPane, setSettingsPane] = useState('personal')
    const [addressForm, setAddressForm] = useState(null) // { id?, label, address }
    const [customerProfileData, setCustomerProfileData] = useState({
        fullName: '',
        phone: '',
        image: '',
        lastUpdated: null
    })
    const [profileAvatar, setProfileAvatar] = useState(null)
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSettingsLoading, setIsSettingsLoading] = useState(false)
    const [activeFaq, setActiveFaq] = useState(null)

    // Compare
    const [compareList, setCompareList] = useState([])
    const [compareOpen, setCompareOpen] = useState(false)

    // Wishlist
    const [wishlist, setWishlist] = useState([])

    // Order success modal
    const [orderSuccess, setOrderSuccess] = useState(null)

    // ── Notification Popup system ─────────────────────────────────────────────
    const [popups, setPopups] = useState([])
    const popupId = useRef(0)

    const showPopup = useCallback(({ title, subtitle, type = 'info', duration = 3500, action }) => {
        const id = ++popupId.current
        setPopups(p => [...p, { id, title, subtitle, type, duration, action }])
        setTimeout(() => setPopups(p => p.filter(n => n.id !== id)), duration)
    }, [])
    const removePopup = useCallback((id) => setPopups(p => p.filter(n => n.id !== id)), [])

    // ── Location State ────────────────────────────────────────────────────────
    const [userLocation, setUserLocation] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLoc = localStorage.getItem('buildmart_customer_location')
            if (savedLoc) {
                setUserLocation(savedLoc)
            } else {
                // Automatically attempt to fetch location natively if none is saved
                handleAllowLocation()
            }
        }
    }, [])

    const handleAllowLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        const city = data.address.city || data.address.town || data.address.village || data.address.state || "Unknown Location";
                        const locString = city + (data.address.country ? `, ${data.address.country}` : '');
                        setUserLocation(locString)
                        localStorage.setItem('buildmart_customer_location', locString)
                        showPopup({ type: 'info', title: 'Location Saved', subtitle: `Set to ${locString}`, duration: 2500 })
                    } catch (error) {
                        const locString = 'Location Allowed'
                        setUserLocation(locString)
                        localStorage.setItem('buildmart_customer_location', locString)
                    }
                },
                (error) => {
                    showPopup({ type: 'warning', title: 'Location Denied', subtitle: 'Please allow location to see accurate delivery info.', duration: 3000 })
                    handleManualLocation('Mumbai, India')
                }
            );
        } else {
            showPopup({ type: 'warning', title: 'Error', subtitle: 'Geolocation not supported by this browser.', duration: 3000 })
            handleManualLocation('Mumbai, India')
        }
    }

    const handleManualLocation = (loc) => {
        setUserLocation(loc)
        localStorage.setItem('buildmart_customer_location', loc)
    }

    // ── Effects ───────────────────────────────────────────────────────────────
    // Close profile on outside click
    useEffect(() => {
        const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // Close compare on Escape
    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') { setCompareOpen(false); setOrderSuccess(null) } }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [])

    // Fetch products on mount
    useEffect(() => {
        if (isAuthenticated && typeof fetchProducts === 'function') fetchProducts()
    }, [isAuthenticated])

    const fetchCustomerProfile = useCallback(async () => {
        if (!currentUser?.$id && !currentUser?.id) return
        const cid = currentUser?.$id || currentUser?.id
        try {
            const res = await fetch(`/api/customer/profile?customerId=${cid}`)
            if (res.ok) {
                const data = await res.json()
                setCustomerProfileData({
                    fullName: data.fullName || currentUser?.name || '',
                    phone: data.phone || currentUser?.phone || '',
                    image: data.image || '',
                    lastUpdated: data.lastUpdated || null
                })
                if (data.image) {
                    setProfileAvatar(data.image)
                } else {
                    setProfileAvatar(null)
                }
            }
        } catch (err) {
            console.error('Failed to fetch customer profile:', err)
        }
    }, [currentUser])

    useEffect(() => {
        if (isAuthenticated) {
            fetchCustomerProfile()
        }
    }, [isAuthenticated, currentUser, fetchCustomerProfile])

    const handleAvatarClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (file) {
                setIsUploading(true)
                showPopup({ title: 'Uploading...', type: 'info', subtitle: 'Saving your photo' })
                try {
                    const BUCKET_ID = '699c1e25002897a5f274';
                    const res = await storage.createFile(BUCKET_ID, ID.unique(), file)
                    const fileUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=69982e8d002d1ba49951`

                    setProfileAvatar(fileUrl)
                    setCustomerProfileData(prev => ({ ...prev, image: fileUrl }))
                    showPopup({ title: 'Image uploaded!', type: 'success', subtitle: 'Click Save Settings below to persist.' })
                } catch (err) {
                    console.error('Cloud upload failed:', err)
                    const reader = new FileReader()
                    reader.onload = (readerEvent) => {
                        const base64 = readerEvent.target.result
                        setProfileAvatar(base64)
                        setCustomerProfileData(prev => ({ ...prev, image: base64 }))
                        showPopup({ title: 'Stored locally', type: 'info', subtitle: 'Cloud upload failed, using local storage' })
                    }
                    reader.readAsDataURL(file)
                } finally {
                    setIsUploading(false)
                }
            }
        }
        input.click()
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsSettingsLoading(true)
        const cid = currentUser?.$id || currentUser?.id

        try {
            const finalImage = profileAvatar || customerProfileData.image || ''
            const payload = {
                ...customerProfileData,
                image: finalImage
            }

            if (!cid) {
                showPopup({ title: 'Update failed', type: 'error', subtitle: 'User ID is missing. Please refresh.' })
                return
            }

            const res = await fetch(`/api/customer/profile?customerId=${cid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (res.ok) {
                if (data.receivedImage) {
                    setProfileAvatar(data.receivedImage)
                    setCustomerProfileData(prev => ({ ...prev, image: data.receivedImage }))
                }
                showPopup({ title: 'Profile updated successfully!', type: 'success' })
                setIsEditingProfile(false)
                fetchCustomerProfile()
            } else if (res.status === 403) {
                showPopup({ title: 'Profile Locked', type: 'info', subtitle: data.message })
            } else {
                showPopup({ title: 'Error', type: 'error', subtitle: data.message || 'Failed to update profile' })
            }
        } catch (err) {
            console.error('Profile update error:', err)
            showPopup({ title: 'Update failed', type: 'error', subtitle: err.message || 'An error occurred' })
        } finally {
            setIsSettingsLoading(false)
        }
    }

    // ── Auth guard ────────────────────────────────────────────────────────────
    if (authLoading) return <ConstructionLoader message="Loading…" />
    if (!isAuthenticated) return <LoginForm role="customer" isOverlay={false} />

    // ── Cart helpers (using AppContext) ────────────────────────────────────────
    const handleAddToCart = (product, qty = product.minOrder || 1) => {
        ctxAddToCart(product, qty)
        showPopup({
            type: 'cart',
            title: 'Added to Cart',
            subtitle: `${product.name} × ${qty}`,
            duration: 3000,
            action: { label: 'View Cart →', onClick: () => setActiveTab('cart') },
        })
    }

    const handleRemoveFromCart = (id) => {
        const item = cart.find(i => i.id === id)
        ctxRemoveFromCart(id)
        showPopup({
            type: 'info',
            title: 'Removed from Cart',
            subtitle: item?.name || 'Item removed',
            duration: 2500,
        })
    }

    const handleUpdateQty = (id, qty) => {
        if (qty < 1) return handleRemoveFromCart(id)
        ctxUpdateQty(id, qty)
    }

    const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart])
    const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])

    // ── Compare ───────────────────────────────────────────────────────────────
    const toggleCompare = (product) => {
        setCompareList(prev => {
            const exists = prev.find(p => p.id === product.id)
            if (exists) {
                const next = prev.filter(p => p.id !== product.id)
                if (next.length === 0) setCompareOpen(false)
                showPopup({ type: 'info', title: 'Removed from Compare', subtitle: product.name, duration: 2000 })
                return next
            }
            if (prev.length >= 3) {
                showPopup({ type: 'warning', title: 'Max 3 Products', subtitle: 'Remove one to add another', duration: 2500 })
                return prev
            }
            setCompareOpen(true)
            showPopup({ type: 'info', title: 'Added to Compare', subtitle: `${product.name} (${prev.length + 1}/3)`, duration: 2000 })
            return [...prev, product]
        })
    }
    const removeFromCompare = (id) => {
        setCompareList(prev => {
            const next = prev.filter(p => p.id !== id)
            if (next.length === 0) setCompareOpen(false)
            return next
        })
    }

    // ── Wishlist ──────────────────────────────────────────────────────────────
    const toggleWishlist = (product) => {
        setWishlist(prev => {
            if (prev.find(p => p.id === product.id)) {
                showPopup({ type: 'info', title: 'Removed from Wishlist', subtitle: product.name, duration: 2000 })
                return prev.filter(p => p.id !== product.id)
            }
            showPopup({
                type: 'wishlist',
                title: 'Saved to Wishlist',
                subtitle: product.name,
                duration: 3000,
                action: { label: 'View Wishlist →', onClick: () => setActiveTab('wishlist') },
            })
            return [...prev, product]
        })
    }

    // ── Share ─────────────────────────────────────────────────────────────────
    const shareProduct = async (product) => {
        const url = `${window.location.origin}/product/${product.id}`
        const text = `Check out ${product.name} at ${formatCurrency(product.price)} / ${product.unit} on BuildMart!\n\n${product.description || 'Great construction materials available locally.'}`
        if (navigator.share) {
            try { await navigator.share({ title: product.name, text, url }) } catch { }
        } else {
            navigator.clipboard.writeText(`${text}\n${url}`)
            showPopup({ type: 'share', title: 'Link Copied!', subtitle: 'Product details copied to clipboard', duration: 2500 })
        }
    }

    // ── Filtered + sorted products ────────────────────────────────────────────
    const sorted = useMemo(() => {
        const filteredList = products.filter(p => {
            const q = searchQuery.toLowerCase()
            return (p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)) &&
                (selectedCategory === 'all' || p.category === selectedCategory)
        })

        return [...filteredList].sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price
            if (sortBy === 'price_desc') return b.price - a.price
            if (sortBy === 'rating') {
                const aRating = a.ratingCount > 0 ? a.rating : -1;
                const bRating = b.ratingCount > 0 ? b.rating : -1;
                if (bRating !== aRating) {
                    return bRating - aRating;
                }
                return (b.ratingCount || 0) - (a.ratingCount || 0);
            }
            return 0
        })
    }, [products, searchQuery, selectedCategory, sortBy])

    // ── Place Order (shows success modal) ─────────────────────────────────────
    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            showPopup({ type: 'warning', title: 'Cart is Empty', subtitle: 'Add products before placing an order', duration: 3000 })
            return
        }
        if (isPlacingOrder) return;
        setIsPlacingOrder(true);

        // Simulate a small delay for UX so button shows "Processing..."
        setTimeout(() => {
            const order = createOrder({
                items: cart,
                totalAmount: cartTotal,
                deliveryAddress: selectedAddress,
                paymentMethod: selectedPayment,
                deliveryMethod,
            })
            setOrderSuccess(order)
            setIsPlacingOrder(false)
        }, 600)
    }

    const StarIcon = ({ filled }) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    )

    const renderStars = (r) => Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < Math.floor(r || 4)} />)
    const minPrice = compareList.length > 1 ? Math.min(...compareList.map(p => p.price)) : null

    // ── Product Card ──────────────────────────────────────────────────────────
    const ProductCard = ({ product, listMode }) => {
        const inCart = cart.find(i => i.id === product.id)
        const inCompare = !!compareList.find(p => p.id === product.id)
        const inWishlist = !!wishlist.find(p => p.id === product.id)
        return (
            <div className={listMode ? styles.productCardList : styles.productCard}>
                <Link href={`/product/${product.id}`} className={styles.productImageLink}>
                    <div className={styles.productImageWrap}>
                        {product.image && typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('data:'))
                            ? <img src={product.image} alt={product.name} className={styles.productImg} />
                            : <div className={styles.productImgFallback}><ProductIllustration category={product.category} /></div>}
                        <div className={styles.productOverlay} onClick={e => e.preventDefault()}>
                            <button className={`${styles.overlayBtn} ${inWishlist ? styles.overlayBtnRed : ''}`} title="Wishlist"
                                onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }}>
                                <HeartIcon active={inWishlist} />
                            </button>
                            <button className={`${styles.overlayBtn} ${inCompare ? styles.overlayBtnBlue : ''}`}
                                title={inCompare ? 'Remove from compare' : 'Compare'}
                                onClick={e => { e.preventDefault(); e.stopPropagation(); toggleCompare(product) }}>
                                <CompareIcon active={inCompare} />
                            </button>
                            <button className={styles.overlayBtn} title="Share"
                                onClick={e => { e.preventDefault(); e.stopPropagation(); shareProduct(product) }}>
                                <ShareIcon />
                            </button>
                        </div>
                        {product.stock > 0 && product.stock < 20 && <span className={styles.stockBadge}>Limited Stock</span>}
                        {product.stock === 0 && <span className={`${styles.stockBadge} ${styles.outOfStock}`}>Out of Stock</span>}
                    </div>
                </Link>
                <div className={styles.productInfo}>
                    <div className={styles.productMeta}>
                        <span className={styles.productCategory}>{product.category}</span>
                        <div className={styles.productRating}>
                            {product.ratingCount > 0 ? (
                                <>
                                    {renderStars(product.rating)}
                                    <span>{(product.rating).toFixed(1)}</span>
                                </>
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No ratings yet</span>
                            )}
                        </div>
                    </div>
                    <Link href={`/product/${product.id}`} className={styles.productNameLink}>
                        <h3 className={styles.productName}>{product.name}</h3>
                    </Link>
                    <p className={styles.productSupplier}><LocationIcon />{product.supplierName || 'BuildMart Verified'} · Local</p>
                    <div className={styles.productPriceRow}>
                        <span className={styles.productPrice}>{formatCurrency(product.price)}</span>
                        <span className={styles.productUnit}>/ {product.unit}</span>
                    </div>
                    <p className={styles.productMin}>Min order: {product.minOrder || 1} {product.unit}</p>
                    <div className={styles.productActions}>
                        {inCart ? (
                            <div className={styles.qtyControl}>
                                <button onClick={() => handleUpdateQty(product.id, inCart.quantity - 1)}>−</button>
                                <span>{inCart.quantity}</span>
                                <button onClick={() => handleUpdateQty(product.id, inCart.quantity + 1)}>+</button>
                            </div>
                        ) : (
                            <button className={styles.btnAddCart} onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>Add to Cart</button>
                        )}
                        <button className={styles.btnBuyNow} onClick={() => { handleAddToCart(product); setActiveTab('cart') }} disabled={product.stock === 0}>Buy Now</button>
                    </div>
                </div>
            </div>
        )
    }

    const myUid = currentUser?.$id || currentUser?.id
    const myOrders = orders.filter(o => o.customerId === myUid)

    return (
        <div className={styles.container}>
            <NotificationPopups popups={popups} removePopup={removePopup} />
            <OrderSuccessModal
                order={orderSuccess}
                onClose={() => { setOrderSuccess(null); setActiveTab('browse') }}
                onViewOrders={() => { setOrderSuccess(null); setActiveTab('orders') }}
            />

            {/* ── Navbar ───────────────────────────────────────────────── */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🏗️</span>
                        <span className={styles.logoText}>BuildMart</span>
                    </div>

                    {/* Location Display */}
                    <div className={styles.navLocation} onClick={handleAllowLocation} title="Click to refresh location" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-2)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <LocationIcon />
                        <span style={{ fontWeight: '500', color: 'var(--text-1)', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userLocation || 'Getting Location...'}
                        </span>
                        <ChevronDown />
                    </div>

                    <div className={styles.navSearchBar}>
                        <span className={styles.navSearchIcon}><SearchIcon /></span>
                        <input type="text" placeholder="Search materials…" value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setActiveTab('browse') }}
                            className={styles.navSearchInput} />
                        {searchQuery && <button className={styles.navSearchClear} onClick={() => setSearchQuery('')}><CloseIcon /></button>}
                    </div>
                    <div className={styles.navRight}>
                        {compareList.length > 0 && (
                            <button className={styles.comparePill} onClick={() => setCompareOpen(true)}>
                                <CompareDrawerIcon /> Compare ({compareList.length})
                            </button>
                        )}
                        <button className={styles.navIconBtn} onClick={() => setActiveTab('cart')} title="Cart">
                            <CartSvg />
                            {cart.length > 0 && <span className={styles.badge}>{cart.length}</span>}
                        </button>
                        <div className={styles.profileWrap} ref={profileRef}>
                            <button className={styles.profileBtn} onClick={() => setShowProfile(p => !p)}>
                                {customerProfileData.image ? (
                                    <img src={customerProfileData.image} alt="Profile" className={styles.profileAvatar} style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className={styles.profileAvatar}>{(customerProfileData.fullName || currentUser?.name || 'C')[0].toUpperCase()}</div>
                                )}
                                <span className={styles.profileName}>{(customerProfileData.fullName || currentUser?.name || 'Account').split(' ')[0]}</span>
                                <ChevronDown />
                            </button>
                            {showProfile && (
                                <div className={styles.profileDropdown}>
                                    <div className={styles.profileHeader} onClick={() => { setActiveTab('profile'); setSettingsPane('personal'); setShowProfile(false) }} style={{ cursor: 'pointer' }}>
                                        {customerProfileData.image ? (
                                            <img src={customerProfileData.image} alt="Profile" className={styles.profileAvatarLg} style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div className={styles.profileAvatarLg}>{(customerProfileData.fullName || currentUser?.name || 'C')[0].toUpperCase()}</div>
                                        )}
                                        <div>
                                            <p className={styles.profileFullName}>{customerProfileData.fullName || currentUser?.name || 'Customer'}</p>
                                            <p className={styles.profileEmail}>{currentUser?.email || ''}</p>
                                            <span className={styles.profileRoleBadge}>Customer</span>
                                        </div>
                                    </div>
                                    <hr className={styles.dropdownDivider} />

                                    <button className={styles.dropdownItem} onClick={() => { setActiveTab('orders'); setShowProfile(false) }}>
                                        <BoxIcon /> My Orders
                                        {myOrders.length > 0 && <span className={styles.dropdownCount}>{myOrders.length}</span>}
                                    </button>
                                    <button className={styles.dropdownItem} onClick={() => { setActiveTab('wishlist'); setShowProfile(false) }}>
                                        <HeartIcon active={false} color="currentColor" /> Wishlist
                                        {wishlist.length > 0 && <span className={styles.dropdownCount}>{wishlist.length}</span>}
                                    </button>
                                    <button className={styles.dropdownItem} onClick={() => { setActiveTab('cart'); setShowProfile(false) }}>
                                        <CartSvg /> Cart
                                        {cart.length > 0 && <span className={styles.dropdownCount}>{cart.length}</span>}
                                    </button>

                                    <hr className={styles.dropdownDivider} />

                                    <button className={styles.dropdownItem} onClick={() => {
                                        setShowProfile(false)
                                        setSettingsPane('addresses')
                                        setActiveTab('profile')
                                    }}>
                                        <LocationIcon /> Saved Addresses
                                        <span className={styles.dropdownCount}>{savedAddresses.length}</span>
                                    </button>
                                    <button className={styles.dropdownItem} onClick={() => {
                                        setShowProfile(false)
                                        setSettingsPane('support')
                                        setActiveTab('profile')
                                    }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        Help & Support
                                    </button>

                                    <hr className={styles.dropdownDivider} />

                                    <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => { setShowProfile(false); logout() }}>
                                        <LogoutIcon /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* ── BROWSE TAB ──────────────────────────────────────────── */}
                    {activeTab === 'browse' && (
                        <main className={styles.main}>
                            <div className={styles.filterBar}>
                                <div className={styles.categoryScroll}>
                                    <button className={`${styles.catChip} ${selectedCategory === 'all' ? styles.catChipActive : ''}`} onClick={() => setSelectedCategory('all')}>All</button>
                                    {productCategories.map(cat => (
                                        <button key={cat.name} className={`${styles.catChip} ${selectedCategory === cat.name ? styles.catChipActive : ''}`} onClick={() => setSelectedCategory(cat.name)}>
                                            {catIcons[cat.name]} {cat.name}
                                        </button>
                                    ))}
                                </div>
                                <div className={styles.sortRow}>
                                    <div className={styles.sortSelectWrapper} ref={sortRef}>
                                        <button className={styles.sortSelectBtn} onClick={() => setIsSortOpen(!isSortOpen)}>
                                            <div className={styles.sortSelectIcon}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                            </div>
                                            <span>{
                                                sortBy === 'default' ? 'Default sorting' :
                                                    sortBy === 'price_asc' ? 'Price: Low to High' :
                                                        sortBy === 'price_desc' ? 'Price: High to Low' :
                                                            sortBy === 'rating' ? 'Top Rated First' : 'Sort'
                                            }</span>
                                            <div className={`${styles.sortSelectChevron} ${isSortOpen ? styles.open : ''}`}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </div>
                                        </button>
                                        {isSortOpen && (
                                            <ul className={styles.sortDropdownMenu}>
                                                {[
                                                    { value: 'default', label: 'Default sorting' },
                                                    { value: 'price_asc', label: 'Price: Low to High' },
                                                    { value: 'price_desc', label: 'Price: High to Low' },
                                                    { value: 'rating', label: 'Top Rated First' }
                                                ].map(opt => (
                                                    <li
                                                        key={opt.value}
                                                        className={`${styles.sortOption} ${sortBy === opt.value ? styles.active : ''}`}
                                                        onClick={() => {
                                                            setSortBy(opt.value)
                                                            setIsSortOpen(false)
                                                        }}
                                                    >
                                                        {opt.label}
                                                        {sortBy === opt.value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <button className={`${styles.viewToggle} ${viewMode === 'grid' ? styles.viewToggleActive : ''}`} onClick={() => setViewMode('grid')}><GridIcon /></button>
                                    <button className={`${styles.viewToggle} ${viewMode === 'list' ? styles.viewToggleActive : ''}`} onClick={() => setViewMode('list')}><ListIcon /></button>
                                </div>
                            </div>
                            <p className={styles.resultCount}>{sorted.length} product{sorted.length !== 1 ? 's' : ''}{searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}{selectedCategory !== 'all' && <span> in <strong>{selectedCategory}</strong></span>}</p>
                            {sorted.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <BoxIcon /><h3>No products found</h3><p>Try different filters</p>
                                    <button className={styles.btnPrimary} onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>Clear Filters</button>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? styles.productGrid : styles.productList}>
                                    {sorted.map(product => <ProductCard key={product.id} product={product} listMode={viewMode === 'list'} />)}
                                </div>
                            )}
                        </main>
                    )}

                    {/* ── CART TAB ────────────────────────────────────────────── */}
                    {activeTab === 'cart' && (
                        <main className={styles.main}>
                            <h2 className={styles.pageTitle}>Shopping Cart</h2>
                            {cart.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <CartSvg /><h3>Your cart is empty</h3><p>Add materials to get started</p>
                                    <button className={styles.btnPrimary} onClick={() => setActiveTab('browse')}>Browse Materials</button>
                                </div>
                            ) : (
                                <div className={styles.cartLayout}>
                                    <div className={styles.cartItems}>
                                        {cart.map(item => (
                                            <div key={item.id} className={styles.cartItem}>
                                                <CartItemImage item={item} />
                                                <div className={styles.cartItemInfo}>
                                                    <p className={styles.cartItemCat}>{item.category}</p>
                                                    <h4 className={styles.cartItemName}>{item.name}</h4>
                                                    <p className={styles.cartItemSupplier}>{item.supplierName || 'BuildMart Verified'}</p>
                                                    <div className={styles.cartItemBottom}>
                                                        <div className={styles.qtyControl}>
                                                            <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>−</button>
                                                            <span>{item.quantity}</span>
                                                            <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                                                        </div>
                                                        <span className={styles.cartItemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                                                        <button className={styles.cartItemRemove} onClick={() => handleRemoveFromCart(item.id)}><TrashIcon /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.orderSummary}>
                                        <h3>Order Summary</h3>
                                        <div className={styles.summaryRow}><span>Subtotal ({cartCount} items)</span><span>{formatCurrency(cartTotal)}</span></div>
                                        {deliveryMethod === 'tempo' ? (
                                            <div className={styles.summaryRow}>
                                                <span>Delivery Charge</span>
                                                <span style={{ color: '#f59e0b', fontWeight: 700 }}>₹22/km</span>
                                            </div>
                                        ) : (
                                            <div className={styles.summaryRow}><span>Delivery</span><span className={styles.summaryFree}>FREE</span></div>
                                        )}
                                        <div className={styles.summaryRow}><span>GST (18%)</span><span>{formatCurrency(cartTotal * 0.18)}</span></div>
                                        {deliveryMethod === 'tempo' && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', background: 'var(--surface-3)', borderRadius: '6px', padding: '0.45rem 0.6rem', margin: '0.2rem 0', lineHeight: 1.5 }}>
                                                🚚 Driver charges ₹22 per km. Final delivery amount added after delivery based on actual distance.
                                            </div>
                                        )}
                                        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Total (excl. delivery)</span><span>{formatCurrency(cartTotal * 1.18)}</span></div>

                                        <p className={styles.summaryLabel}>Delivery Method</p>
                                        <div className={styles.deliveryOptions}>
                                            {[{ id: 'tempo', label: 'Tempo Delivery', sub: 'Same Day', icon: <TruckIcon /> }, { id: 'pickup', label: 'Self Pickup', sub: 'Free', icon: <BoxIcon /> }].map(o => (
                                                <label key={o.id} className={`${styles.deliveryOption} ${deliveryMethod === o.id ? styles.deliveryOptionActive : ''}`}>
                                                    <input type="radio" name="delivery" value={o.id} checked={deliveryMethod === o.id} onChange={() => setDeliveryMethod(o.id)} />
                                                    {o.icon}<div><strong>{o.label}</strong><span>{o.sub}</span></div>
                                                </label>
                                            ))}
                                        </div>
                                        <p className={styles.summaryLabel}>Delivery Address</p>
                                        {selectedAddress && (
                                            <div style={{ fontSize: '0.8rem', background: 'var(--surface-3)', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '0.5rem', color: 'var(--text-1)', lineHeight: 1.5 }}>
                                                <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: 4 }}>📍</span>{selectedAddress}
                                            </div>
                                        )}
                                        {savedAddresses.length > 1 && (
                                            <select className={styles.addrSelect} value={selectedAddress} onChange={e => setSelectedAddress(e.target.value)}>
                                                {savedAddresses.map(a => <option key={a.id} value={a.address}>{a.label} — {a.address}</option>)}
                                            </select>
                                        )}
                                        <p className={styles.summaryLabel}>Payment</p>
                                        <div className={styles.paymentOptions}>
                                            {[{ id: 'upi', label: 'UPI / Net Banking' }, { id: 'cod', label: 'Pay on Delivery' }].map(p => (
                                                <label key={p.id} className={`${styles.paymentOption} ${selectedPayment === p.id ? styles.paymentOptionActive : ''}`}>
                                                    <input type="radio" name="payment" value={p.id} checked={selectedPayment === p.id} onChange={() => setSelectedPayment(p.id)} />
                                                    {p.label}
                                                </label>
                                            ))}
                                        </div>
                                        <button className={styles.btnCheckout} onClick={handlePlaceOrder} disabled={isPlacingOrder} style={{ opacity: isPlacingOrder ? 0.7 : 1, cursor: isPlacingOrder ? 'not-allowed' : 'pointer' }}>
                                            {isPlacingOrder ? 'Processing...' : `Place Order · ${formatCurrency(cartTotal * 1.18)}${deliveryMethod === 'tempo' ? ' + ₹22/km' : ''}`}
                                        </button>
                                        <button className={styles.btnContinue} onClick={() => setActiveTab('browse')}>← Continue Shopping</button>
                                    </div>
                                </div>
                            )}
                        </main>
                    )}

                    {/* ── ORDERS TAB — with live tracking ─────────────────── */}
                    {activeTab === 'orders' && (
                        <main className={styles.main}>
                            <h2 className={styles.pageTitle}>My Orders</h2>
                            {(() => {
                                return myOrders.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <BoxIcon /><h3>No orders yet</h3><p>Placed orders will appear here</p>
                                        <button className={styles.btnPrimary} onClick={() => setActiveTab('browse')}>Start Shopping</button>
                                    </div>
                                ) : (
                                    <div className={styles.ordersList}>
                                        {myOrders.slice().reverse().map(order => {
                                            const STEPS = [
                                                { key: 'new', label: 'Order Placed', icon: <BoxIcon />, desc: 'Your order has been received' },
                                                { key: 'confirmed', label: 'Confirmed', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, desc: 'Supplier has confirmed your order' },
                                                { key: 'packed', label: 'Packed & Ready', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>, desc: 'Materials packed and ready for dispatch' },
                                                { key: 'in_transit', label: 'Out for Delivery', icon: <TruckIcon />, desc: 'Driver is on the way to your location' },
                                                { key: 'delivered', label: 'Delivered', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>, desc: 'Successfully delivered to you' },
                                            ]
                                            const statusIdx = Math.max(0, STEPS.findIndex(s => s.key === order.status))

                                            const isExpanded = expandedOrders[order.id] !== undefined ? expandedOrders[order.id] : order.status !== 'delivered'
                                            const toggleExpand = () => setExpandedOrders(prev => ({ ...prev, [order.id]: !isExpanded }))

                                            return (
                                                <div key={order.id} className={styles.orderCard}>
                                                    {/* Header */}
                                                    <div className={styles.orderCardHeader} onClick={toggleExpand} style={{ cursor: 'pointer', userSelect: 'none', marginBottom: isExpanded ? '0.75rem' : '0' }}>
                                                        <div>
                                                            <span className={styles.orderId}>{order.id}</span>
                                                            <span className={`${styles.orderStatus} ${styles[`status_${order.status}`]}`}>{order.status?.replace('_', ' ').toUpperCase()}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-3)' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div style={{ borderTop: '0px solid var(--border)', paddingTop: '0' }}>
                                                            {/* ── Tracking Timeline ─────────────────── */}
                                                            <div className={styles.trackingTimeline}>
                                                                {STEPS.map((step, i) => {
                                                                    const done = i <= statusIdx
                                                                    const active = i === statusIdx
                                                                    return (
                                                                        <div key={step.key} className={`${styles.trackStep} ${done ? styles.trackDone : ''} ${active ? styles.trackActive : ''}`}>
                                                                            <div className={styles.trackDot}>
                                                                                {done ? (
                                                                                    <div className={styles.trackDotInner}>{step.icon}</div>
                                                                                ) : (
                                                                                    <div className={styles.trackDotEmpty}>{i + 1}</div>
                                                                                )}
                                                                            </div>
                                                                            {i < STEPS.length - 1 && (
                                                                                <div className={`${styles.trackLine} ${i < statusIdx ? styles.trackLineDone : ''}`} />
                                                                            )}
                                                                            <div className={styles.trackLabel}>
                                                                                <span className={styles.trackLabelText}>{step.label}</span>
                                                                                {active && <span className={styles.trackLabelDesc}>{step.desc}</span>}
                                                                                {done && i === 0 && (
                                                                                    <span className={styles.trackLabelTime}>
                                                                                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>

                                                            {/* Items list */}
                                                            <div className={styles.orderItems}>
                                                                {order.items?.slice(0, 3).map((item, i) => (
                                                                    <div key={i} className={styles.orderItemRow}>
                                                                        <span>{item.name}</span>
                                                                        <span>{item.quantity} {item.unit} · {formatCurrency(item.price * item.quantity)}</span>
                                                                    </div>
                                                                ))}
                                                                {order.items?.length > 3 && <p className={styles.moreItems}>+{order.items.length - 3} more</p>}
                                                            </div>

                                                            {/* Footer */}
                                                            <div className={styles.orderCardFooter}>
                                                                <span className={styles.orderAddr}><LocationIcon />{order.deliveryAddress}</span>
                                                                <span className={styles.orderTotal}>{formatCurrency(order.totalAmount)}</span>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className={styles.orderCardActions}>
                                                                {order.status === 'in_transit' && (() => {
                                                                    // Mask driver number for privacy
                                                                    const maskPhone = (p) => {
                                                                        if (!p) return null
                                                                        const d = String(p).replace(/\D/g, '')
                                                                        return d.length < 7 ? '****' : d.slice(0, 2) + 'XXXXX' + d.slice(-3)
                                                                    }
                                                                    const masked = maskPhone(order.driverPhone)
                                                                    return (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
                                                                                <TruckIcon />
                                                                                <span style={{ color: 'var(--text-2)', flexGrow: 1 }}>
                                                                                    Driver: <strong style={{ color: 'var(--text-1)' }}>{order.driverName || 'Assigned'}</strong>
                                                                                </span>
                                                                                {masked ? (
                                                                                    <>
                                                                                        <span style={{ fontFamily: 'monospace', color: 'var(--text-3)', letterSpacing: '0.04em' }}>{masked}</span>
                                                                                        <span style={{ fontSize: '0.6rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>🔒 masked</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <span style={{ color: 'var(--text-4)', fontSize: '0.72rem' }}>No number</span>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                disabled={!order.driverPhone}
                                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: 700, background: order.driverPhone ? 'var(--primary)' : 'var(--surface-3)', color: order.driverPhone ? 'white' : 'var(--text-4)', border: 'none', borderRadius: '8px', cursor: order.driverPhone ? 'pointer' : 'not-allowed', transition: 'opacity 0.2s' }}
                                                                                onClick={() => { if (order.driverPhone) window.location.href = `tel:${order.driverPhone}` }}>
                                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.5 19.79 19.79 0 0 1 1.06 2.86 2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                                                Call Driver {masked ? `· ${masked}` : ''}
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                })()}
                                                                {order.status === 'delivered' && (
                                                                    <button className={styles.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                                                                        onClick={() => { order.items?.forEach(item => handleAddToCart(item, item.quantity)); setActiveTab('cart') }}>
                                                                        Reorder
                                                                    </button>
                                                                )}
                                                                <button className={styles.btnOutline} style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                                                                    onClick={() => {
                                                                        const text = `Order ${order.id}\n${order.items?.map(i => `${i.name} × ${i.quantity}`).join('\n')}\nTotal: ${formatCurrency(order.totalAmount)}`
                                                                        navigator.clipboard.writeText(text)
                                                                        showPopup({ type: 'share', title: 'Copied!', subtitle: 'Order details copied to clipboard', duration: 2000 })
                                                                    }}>
                                                                    Copy Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })()}
                        </main>
                    )}

                    {/* ── WISHLIST TAB ─────────────────────────────────────────── */}
                    {activeTab === 'wishlist' && (
                        <main className={styles.main}>
                            <h2 className={styles.pageTitle}>Wishlist</h2>
                            {wishlist.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <HeartIcon /><h3>Wishlist is empty</h3><p>Tap the heart icon on any product to save it</p>
                                    <button className={styles.btnPrimary} onClick={() => setActiveTab('browse')}>Browse Materials</button>
                                </div>
                            ) : (
                                <div className={styles.productGrid}>
                                    {wishlist.map(product => <ProductCard key={product.id} product={product} listMode={false} />)}
                                </div>
                            )}
                        </main>
                    )}

                    {/* ── PROFILE & SETTINGS VIEW ───────────────────────────────────────── */}
                    {activeTab === 'profile' && (
                        <main className={styles.main}>
                            <div className={styles.settingsLayout}>
                                {/* Settings Sidebar */}
                                <aside className={styles.settingsSidebar}>
                                    <div className={styles.settingsAvatarCard}>
                                        <div className={styles.profileAvatarExtraLarge} onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                                            {profileAvatar ? (
                                                <img src={profileAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                currentUser?.name?.[0] || 'C'
                                            )}
                                        </div>
                                        <h3>{customerProfileData.fullName || currentUser?.name || 'Customer'}</h3>
                                        <p>{currentUser?.email}</p>
                                    </div>

                                    <nav className={styles.settingsNav}>
                                        <button
                                            className={`${styles.settingsNavItem} ${settingsPane === 'personal' ? styles.settingsNavItemActive : ''}`}
                                            onClick={() => setSettingsPane('personal')}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            Personal Info
                                        </button>
                                        <button
                                            className={`${styles.settingsNavItem} ${settingsPane === 'addresses' ? styles.settingsNavItemActive : ''}`}
                                            onClick={() => setSettingsPane('addresses')}
                                        >
                                            <LocationIcon />
                                            Addresses
                                        </button>
                                        <button
                                            className={`${styles.settingsNavItem} ${settingsPane === 'support' ? styles.settingsNavItemActive : ''}`}
                                            onClick={() => setSettingsPane('support')}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                            Help & Support
                                        </button>
                                    </nav>
                                </aside>

                                {/* Settings Content */}
                                <div className={styles.settingsContent}>
                                    {/* Personal Info Pane */}
                                    {settingsPane === 'personal' && (
                                        <div className={styles.profileSection}>
                                            <div className={styles.profileSectionHeader}>
                                                <h3>Personal Information</h3>
                                                {!isEditingProfile && (
                                                    <button className={styles.btnOutline} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setIsEditingProfile(true)}>
                                                        Edit Profile
                                                    </button>
                                                )}
                                            </div>

                                            {isEditingProfile ? (
                                                <form onSubmit={handleUpdateProfile} className={styles.settingsForm}>
                                                    <div className={styles.profileDetailsGrid}>
                                                        <div className={styles.profileDetailField}>
                                                            <label>Full Name</label>
                                                            <input
                                                                type="text"
                                                                value={customerProfileData.fullName}
                                                                onChange={e => setCustomerProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                                                                placeholder={currentUser?.name || "Enter your full name"}
                                                                required
                                                            />
                                                        </div>
                                                        <div className={styles.profileDetailField}>
                                                            <label>Phone Number</label>
                                                            <input
                                                                type="text"
                                                                value={customerProfileData.phone}
                                                                onChange={e => setCustomerProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                                                placeholder={currentUser?.phone || "Enter your phone number"}
                                                            />
                                                        </div>
                                                        {/* Read-only email via Appwrite account settings */}
                                                        <div className={styles.profileDetailField}>
                                                            <label>Email Address</label>
                                                            <input
                                                                type="email"
                                                                value={currentUser?.email || ''}
                                                                disabled
                                                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                                                        <button
                                                            type="submit"
                                                            className={styles.btnPrimary}
                                                            disabled={isSettingsLoading || isUploading}
                                                        >
                                                            {isSettingsLoading ? 'Saving...' : (isUploading ? 'Uploading Image...' : 'Save Settings')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.btnOutline}
                                                            onClick={() => {
                                                                setIsEditingProfile(false);
                                                                fetchCustomerProfile(); // Reset to saved database state
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className={styles.profileDetailsGrid}>
                                                    <div className={styles.profileDetailField}>
                                                        <label>Full Name</label>
                                                        <p>{customerProfileData.fullName || currentUser?.name || 'Customer'}</p>
                                                    </div>
                                                    <div className={styles.profileDetailField}>
                                                        <label>Email Address</label>
                                                        <p>{currentUser?.email || 'customer@example.com'}</p>
                                                    </div>
                                                    <div className={styles.profileDetailField}>
                                                        <label>Phone Number</label>
                                                        <p>{customerProfileData.phone || currentUser?.phone || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {customerProfileData.lastUpdated && !isEditingProfile && (
                                                <div style={{ marginTop: '2rem', display: 'inline-block' }}>
                                                    <div className={styles.updateNotice} style={{ padding: '0.5rem 1rem', display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                                        Profile last updated: {new Date(customerProfileData.lastUpdated).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Addresses Pane */}
                                    {settingsPane === 'addresses' && (
                                        <div className={styles.profileSection}>
                                            <div className={styles.profileSectionHeader}>
                                                <h3>Manage Addresses</h3>
                                                {!addressForm && (
                                                    <button className={styles.btnPrimary} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => {
                                                        setAddressForm({ label: '', address: '' })
                                                    }}>+ Add New</button>
                                                )}
                                            </div>

                                            {addressForm && (
                                                <div className={styles.interactiveAddressForm}>
                                                    <div className={styles.addressFormHeader}>
                                                        <div className={styles.addressFormIconWrapper}>
                                                            <LocationIcon />
                                                        </div>
                                                        <div>
                                                            <h4>{addressForm.id ? 'Edit Address' : 'Add New Address'}</h4>
                                                            <p>Provide a label and your complete delivery address below.</p>
                                                        </div>
                                                    </div>

                                                    <div className={styles.interactiveFormGroup}>
                                                        <input
                                                            id="addrLabel"
                                                            type="text"
                                                            className={styles.interactiveInput}
                                                            value={addressForm.label}
                                                            onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                                            placeholder=" "
                                                        />
                                                        <label htmlFor="addrLabel">Label (e.g. Home, Site A)</label>
                                                        <div className={styles.inputFocusLine}></div>
                                                    </div>

                                                    <div className={styles.interactiveFormGroup}>
                                                        <textarea
                                                            id="addrFull"
                                                            className={styles.interactiveTextarea}
                                                            rows="3"
                                                            value={addressForm.address}
                                                            onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                                                            placeholder=" "
                                                        ></textarea>
                                                        <label htmlFor="addrFull">Full Address</label>
                                                        <div className={styles.inputFocusLine}></div>
                                                    </div>

                                                    <div className={styles.addressFormActions}>
                                                        <button className={styles.btnSecondaryInteractive} onClick={() => setAddressForm(null)}>Cancel</button>
                                                        <button className={styles.btnPrimaryInteractive} onClick={() => {
                                                            if (!addressForm.label || !addressForm.address) {
                                                                alert('Please fill out all fields.')
                                                                return
                                                            }
                                                            if (addressForm.id) {
                                                                setSavedAddresses(prev => prev.map(a => a.id === addressForm.id ? { ...a, label: addressForm.label, address: addressForm.address } : a))
                                                            } else {
                                                                setSavedAddresses(prev => [...prev, { id: Date.now(), label: addressForm.label, address: addressForm.address }])
                                                            }
                                                            setAddressForm(null)
                                                        }}>
                                                            {addressForm.id ? 'Save Changes' : 'Save Address'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {!addressForm && (
                                                <div className={styles.addressList}>
                                                    {savedAddresses.map(addr => (
                                                        <div key={addr.id} className={styles.addressCard}>
                                                            <div className={styles.addressInfo}>
                                                                <h4>{addr.label}</h4>
                                                                <p>{addr.address}</p>
                                                            </div>
                                                            <div className={styles.addressActions}>
                                                                <button className={styles.iconBtn} title="Edit" onClick={() => {
                                                                    setAddressForm({ id: addr.id, label: addr.label, address: addr.address })
                                                                }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                                                                <button className={styles.iconBtn} title="Delete" style={{ color: '#dc2626' }} onClick={() => setSavedAddresses(prev => prev.filter(a => a.id !== addr.id))}><TrashIcon /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {savedAddresses.length === 0 && <p className={styles.emptyText}>No saved addresses found.</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Support Pane */}
                                    {settingsPane === 'support' && (
                                        <div className={styles.profileSection}>
                                            <div className={styles.profileSectionHeader}>
                                                <h3>Help & Support</h3>
                                            </div>
                                            <div className={styles.supportGrid}>
                                                <div className={styles.supportCard}>
                                                    <h4>Contact Us</h4>
                                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                        <strong>1800-123-4567</strong> <span style={{ fontSize: '0.85rem', color: '#64748b' }}>(Mon-Sat, 9 AM - 6 PM)</span>
                                                    </p>
                                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                        <a href="mailto:support@buildmart.com" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>support@buildmart.com</a>
                                                    </p>
                                                </div>
                                                <div className={styles.supportCard}>
                                                    <h4 style={{ marginBottom: '1.25rem' }}>Frequently Asked Questions</h4>
                                                    <div className={styles.faqList}>
                                                        {[
                                                            { q: 'How do I track my active order?', a: 'Navigate to the "Orders" tab in the top navigation menu. Click on any active order to view its real-time status, driver information, and estimated delivery time.' },
                                                            { q: 'Can I modify or cancel an order after placing it?', a: 'Orders can only be modified or cancelled within 30 minutes of placement. Please call our support line immediately at 1800-123-4567 for urgent changes.' },
                                                            { q: 'What is the return policy for surplus materials?', a: 'We accept returns for unused, undamaged materials in their original packaging within 7 days of delivery. A 10% restocking fee applies. Custom-cut or special-order items cannot be returned.' },
                                                            { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, Net Banking, UPI, and corporate bank transfers. For approved enterprise accounts, we offer Net 30 payment terms.' },
                                                            { q: 'How is delivery calculated for bulk building materials?', a: 'Delivery charges are calculated based on the total weight/volume of the materials and the distance from the vendor to your site. You will see the exact delivery cost at checkout before confirming your order.' },
                                                            { q: 'Do you offer unloading services at the site?', a: 'Standard delivery drops materials at the curb or closest accessible point. If you require manual unloading or crane services, please contact support before placing your order to arrange specialized delivery.' },
                                                        ].map((faq, index) => (
                                                            <div key={index} className={`${styles.interactiveFaqItem} ${activeFaq === index ? styles.faqActive : ''}`}>
                                                                <div className={styles.interactiveFaqHeader} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                                                                    <div className={styles.faqQuestionWrap}>
                                                                        <div className={styles.faqIcon}>?</div>
                                                                        <span className={styles.faqQuestionText}>{faq.q}</span>
                                                                    </div>
                                                                    <div className={styles.faqToggleIcon}>
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                                    </div>
                                                                </div>
                                                                <div className={styles.interactiveFaqAnswer}>
                                                                    <div className={styles.faqAnswerContent}>
                                                                        <p>{faq.a}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    )}

                    {/* ── COMPARE DRAWER ───────────────────────────────────────── */}
                    {compareOpen && (
                        <>
                            <div className={styles.drawerBackdrop} onClick={() => setCompareOpen(false)} />
                            <aside className={styles.compareDrawer}>
                                <div className={styles.drawerHeader}>
                                    <div>
                                        <h2><CompareDrawerIcon /> Compare Products</h2>
                                        <p className={styles.drawerHeaderSub}>Click compare on any card to add (max 3)</p>
                                    </div>
                                    <button className={styles.drawerClose} onClick={() => setCompareOpen(false)}><CloseIcon /></button>
                                </div>
                                <div className={styles.drawerSlots}>
                                    {compareList.map(p => (
                                        <div key={p.id} className={styles.compareSlot}>
                                            <span className={styles.slotCat}>{p.category}</span>
                                            <span className={styles.slotName}>{p.name}</span>
                                            <span className={styles.slotPrice}>{formatCurrency(p.price)} / {p.unit}</span>
                                            <button className={styles.slotRemove} onClick={() => removeFromCompare(p.id)}><CloseIcon /></button>
                                        </div>
                                    ))}
                                    {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                                        <div key={i} className={`${styles.compareSlot} ${styles.empty}`}>+ Add product</div>
                                    ))}
                                </div>
                                {compareList.length >= 2 ? (
                                    <div className={styles.drawerTable}>
                                        <table className={styles.compareTable}>
                                            <thead><tr><th>Attribute</th>{compareList.map(p => <th key={p.id}>{p.name}</th>)}</tr></thead>
                                            <tbody>
                                                <tr><td>Image</td>{compareList.map(p => <td key={p.id}><div className={styles.compareProdImg}><ProductIllustration category={p.category} /></div></td>)}</tr>
                                                <tr><td>Category</td>{compareList.map(p => <td key={p.id}>{p.category}</td>)}</tr>
                                                <tr><td>Price</td>{compareList.map(p => <td key={p.id} className={minPrice !== null && p.price === minPrice ? styles.compareBest : ''}><span className={styles.comparePrice}>{formatCurrency(p.price)}</span>{minPrice !== null && p.price === minPrice && <span style={{ fontSize: '0.7rem', display: 'block', color: '#16a34a', fontWeight: 700 }}>✓ Best Price</span>}</td>)}</tr>
                                                <tr><td>Unit</td>{compareList.map(p => <td key={p.id}>{p.unit}</td>)}</tr>
                                                <tr><td>Rating</td>{compareList.map(p => <td key={p.id}><div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{renderStars(p.rating)} <span style={{ fontSize: '0.8rem', marginLeft: 2 }}>{p.rating || 4}</span></div></td>)}</tr>
                                                <tr><td>Supplier</td>{compareList.map(p => <td key={p.id}>{p.supplierName || 'BuildMart'}</td>)}</tr>
                                                <tr><td>Min Order</td>{compareList.map(p => <td key={p.id}>{p.minOrder || 1} {p.unit}</td>)}</tr>
                                                <tr><td>Action</td>{compareList.map(p => <td key={p.id}><button className={styles.btnPrimary} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { handleAddToCart(p); setCompareOpen(false) }}>Add to Cart</button></td>)}</tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={styles.drawerTable} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '3rem 2rem' }}>
                                        <CompareDrawerIcon /><p style={{ margin: 0, fontWeight: 600 }}>Add one more product to compare</p>
                                    </div>
                                )}
                                <div className={styles.drawerFooter}>
                                    <button className={styles.btnClearAll} onClick={() => { setCompareList([]); setCompareOpen(false) }}>Clear All</button>
                                    <button className={styles.btnPrimary} onClick={() => { setCompareOpen(false); setActiveTab('browse') }} style={{ marginLeft: 'auto' }}>+ Add More</button>
                                </div>
                            </aside>
                        </>
                    )}
                </div>

                {/* ── BOTTOM NAV (Mobile Only) ────────────────────────────── */}
                <nav className={styles.bottomNav}>
                    {[
                        { id: 'browse', icon: <SearchIcon />, label: 'Home' },
                        { id: 'cart', icon: <CartSvg />, label: 'Cart', count: cart.length },
                        { id: 'orders', icon: <BoxIcon />, label: 'Orders' },
                        { id: 'wishlist', icon: <HeartIcon active={false} color="currentColor" />, label: 'Saved' },
                        { id: 'profile', icon: <LocationIcon />, label: 'Profile' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.navBtn} ${activeTab === tab.id ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <div className={styles.navIconWrapper}>
                                {tab.icon}
                                {tab.count > 0 && <span className={styles.navBadge}>{tab.count}</span>}
                            </div>
                            <span className={styles.navLabel}>{tab.label}</span>
                        </button>
                    ))}
                </nav>
        </div>
        </div >
    )
}

