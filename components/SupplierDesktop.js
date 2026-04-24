import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { storage, ID } from '../lib/appwrite'
import { useApp } from '../context/AppContext'
import LoginForm from '../components/LoginForm'
import ConstructionLoader from '../components/ConstructionLoader'
import {
    supplierProfile,
    formatCurrency,
    formatDate,
} from '../lib/mockData'
import styles from '../styles/Supplier.module.css'

const getStatusColor = (status) => {
    switch (status) {
        case 'new': return 'badge-info'
        case 'preparing': return 'badge-warning'
        case 'ready': return 'badge-success'
        case 'in_transit': return 'badge-info'
        case 'delivered': return 'badge-success'
        case 'cancelled': return 'badge-danger'
        default: return 'badge-info'
    }
}

const getStatusText = (status) => {
    switch (status) {
        case 'new': return 'New Order'
        case 'preparing': return 'Preparing'
        case 'ready': return 'Ready for Pickup'
        case 'in_transit': return 'In Transit'
        case 'delivered': return 'Delivered'
        case 'cancelled': return 'Cancelled'
        default: return status
    }
}

const categoryUnits = {
    'Cement': ['Bag (50kg)', 'Ton'],
    'Steel': ['Pcs', 'Ton', 'Kg'],
    'Bricks': ['Pcs', '1000 Pcs (Load)'],
    'Sand': ['Ton', 'Cubic Feet (cft)', 'Tractor Load'],
    'Tiles': ['Sq. Ft', 'Box', 'Pcs'],
    'Pipes & Plumbing': ['Pcs', 'Ft', 'Mtr'],
    'Doors & Windows': ['Pcs', 'Set'],
    'Paint & Finishes': ['Liter', 'Bucket (4L)', 'Bucket (10L)', 'Bucket (20L)'],
    'Electrical Wiring': ['Coil (90m)', 'Mtr']
}

// Reusable Custom Select Component
const CustomSelect = ({ value, onChange, options, placeholder = "Select an option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt =>
        (typeof opt === 'string' ? opt : opt.value) === value
    ) || { label: placeholder };

    return (
        <div className={styles.customSelectWrapper} ref={selectRef}>
            <div
                className={`${styles.customSelectHeader} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{typeof selectedOption === 'string' ? selectedOption : selectedOption.label}</span>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.chevron}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <ul className={styles.customSelectList}>
                    {options.map((option, idx) => {
                        const optVal = typeof option === 'string' ? option : option.value;
                        const optLabel = typeof option === 'string' ? option : option.label;
                        return (
                            <li
                                key={idx}
                                className={`${styles.customSelectOption} ${value === optVal ? styles.selected : ''}`}
                                onClick={() => {
                                    onChange({ target: { value: optVal } });
                                    setIsOpen(false);
                                }}
                            >
                                {optLabel}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default function SupplierDashboard() {
    const {
        products: globalProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        currentUser,
        logout,
        orders,
        updateOrderStatus,
        isAuthenticated,
        userRole,
        authLoading
    } = useApp()
    const router = useRouter()
    const [notification, setNotification] = useState(null)

    const showNotification = (message, type = 'success', sub = '') => {
        setNotification({ message, type, sub })
        setTimeout(() => setNotification(null), 5000)
    }

    // ── Hooks (State, Refs, Effects) ──────────────────
    const [activeTab, setActiveTab] = useState('overview')
    const [profileAvatar, setProfileAvatar] = useState(null)
    const [showProfile, setShowProfile] = useState(false)
    const [showNotifs, setShowNotifs] = useState(false)
    const [driverNotifiedOrderId, setDriverNotifiedOrderId] = useState(null)
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingProductId, setEditingProductId] = useState(null)
    const [tempProductImage, setTempProductImage] = useState(null)
    const [activeFaq, setActiveFaq] = useState(null)
    const [productToDelete, setProductToDelete] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'Cement',
        price: '',
        unit: 'Bag (50kg)',
        minOrder: '',
        stock: '',
    })

    // Auto-update unit when category changes
    useEffect(() => {
        if (!isEditing) {
            const defaultUnit = categoryUnits[newProduct.category]?.[0] || 'Unit'
            setNewProduct(prev => ({ ...prev, unit: defaultUnit }))
        }
    }, [newProduct.category, isEditing])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showAddProduct) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [showAddProduct])

    const handleEditProduct = (product) => {
        setNewProduct({
            ...product,
            price: product.price.toString(),
            stock: product.stock.toString(),
            minOrder: product.minOrder ? product.minOrder.toString() : '',
        })
        setEditingProductId(product.id)
        setTempProductImage(product.image)
        setIsEditing(true)
        setShowAddProduct(true)
    }

    const [supplierProfileData, setSupplierProfileData] = useState({
        supplierName: '',
        shopName: '',
        address: '',
        image: '',
        lastUpdated: null
    })
    const [isSettingsLoading, setIsSettingsLoading] = useState(false)

    const fetchSupplierProfile = async () => {
        if (!currentUser?.$id && !currentUser?.id) return
        const sid = currentUser?.$id || currentUser?.id
        try {
            const res = await fetch(`/api/supplier/profile?supplierId=${sid}`)
            if (res.ok) {
                const data = await res.json()
                console.log('DEBUG: Fetched Supplier Profile:', data)
                setSupplierProfileData(data)
                if (data.image) {
                    console.log('DEBUG: Setting profileAvatar to:', data.image)
                    setProfileAvatar(data.image)
                } else {
                    console.log('DEBUG: No image found in fetched profile')
                    setProfileAvatar(null)
                }
            }
        } catch (err) {
            console.error('Failed to fetch supplier profile:', err)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchSupplierProfile()
        }
    }, [isAuthenticated, currentUser])

    const handleAvatarClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (file) {
                setIsUploading(true)
                showNotification('Uploading...', 'info', 'saving photo')
                try {
                    // Actual Appwrite Bucket ID
                    const BUCKET_ID = '699c1e25002897a5f274';
                    const res = await storage.createFile(BUCKET_ID, ID.unique(), file)
                    // Use standard Appwrite file preview URL template
                    const fileUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=69982e8d002d1ba49951`

                    setProfileAvatar(fileUrl)
                    setSupplierProfileData(prev => ({ ...prev, image: fileUrl }))
                    showNotification('Image uploaded!', 'success', 'Click Save Settings below to persist.')
                } catch (err) {
                    console.error('Cloud upload failed:', err)
                    // Fallback to base64 if cloud upload fails (likely due to missing bucket or permissions)
                    const reader = new FileReader()
                    reader.onload = (readerEvent) => {
                        const base64 = readerEvent.target.result
                        setProfileAvatar(base64)
                        setSupplierProfileData(prev => ({ ...prev, image: base64 }))
                        showNotification('Stored locally', 'info', 'Cloud upload failed, using local storage')
                    }
                    reader.readAsDataURL(file)
                } finally {
                    setIsUploading(false)
                }
            }
        }
        input.click()
    }

    const resetProductForm = () => {
        setNewProduct({
            name: '',
            category: 'Cement',
            price: '',
            unit: 'Bag (50kg)',
            minOrder: '',
            stock: '',
        })
        setTempProductImage(null)
        setIsEditing(false)
        setEditingProductId(null)
        setShowAddProduct(false)
    }

    const profileRef = useRef(null)
    const notifsRef = useRef(null)

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false)
            }
            if (notifsRef.current && !notifsRef.current.contains(event.target)) {
                setShowNotifs(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // ── Authentication & Loading Logic ─────────────
    const showAuthOverlay = !authLoading && !isAuthenticated
    const showLoadingScreen = authLoading

    // ── Handlers ─────────────────────────────────────

    // ── Logic ────────────────────────────────────────
    const products = useMemo(() => globalProducts.filter(p =>
        p.supplierId === (currentUser?.$id || currentUser?.id) || (!currentUser && p.supplierId === 'supplier123') || (!p.supplierId)
    ), [globalProducts, currentUser])

    const supplierOrders = useMemo(() => orders.filter(o =>
        !o.supplierId || o.supplierId === (currentUser?.$id || currentUser?.id) || (!currentUser && o.supplierId === 'supplier123')
    ), [orders, currentUser])

    const handleAddProduct = async (e) => {
        e.preventDefault()

        if (isEditing) {
            // Update Existing Product flow
            const res = await updateProduct(editingProductId, {
                ...newProduct,
                price: Number(newProduct.price) || 0,
                stock: Number(newProduct.stock) || 0,
                minOrder: Number(newProduct.minOrder) || 1,
                image: tempProductImage || newProduct.image
            })

            if (res && !res.success) {
                showNotification(res.message || 'Failed to update product', 'error')
                return
            }

            showNotification('Product updated successfully!', 'success')
            resetProductForm()
            return
        }

        // Add New Product flow
        let finalImageUrl = tempProductImage;

        if (!finalImageUrl) {
            const cleanName = newProduct.name.replace(/[^a-zA-Z0-9 ]/g, "");
            const cleanCategory = newProduct.category.replace(/[^a-zA-Z0-9 ]/g, "");
            const imageSearchQuery = `${cleanName} ${cleanCategory} construction material photo`;

            finalImageUrl = '📦'; // Fallback
            try {
                const searchResponse = await fetch(`/api/searchImage?q=${encodeURIComponent(imageSearchQuery)}`);
                if (searchResponse.ok) {
                    const data = await searchResponse.json();
                    if (data.url) {
                        finalImageUrl = data.url;
                    }
                }
            } catch (err) {
                console.error('Image fetch error:', err);
            }
        }

        const product = {
            ...newProduct,
            price: Number(newProduct.price) || 0,
            stock: Number(newProduct.stock) || 0,
            minOrder: Number(newProduct.minOrder) || 1,
            description: `${newProduct.name} - High quality materials for your project.`,
            id: products.length + 1,
            supplierId: currentUser?.$id || currentUser?.id || 'supplier123',
            supplierName: currentUser?.name || 'Your Enterprise',
            supplierLocation: 'Local Depot',
            rating: 5.0,
            image: finalImageUrl,
        }

        const res = await addProduct(product)
        if (res && !res.success) {
            showNotification(res.message || 'Failed to add product', 'error')
            return
        }
        showNotification('Product added to inventory!', 'success')
        resetProductForm()
    }

    const handleAcceptOrder = (orderId) => {
        const order = supplierOrders.find(o => o.id === orderId)
        updateOrderStatus(orderId, 'preparing')
        // If this is a Tempo order, notify the driver immediately
        if (order?.deliveryMethod === 'tempo') {
            setDriverNotifiedOrderId(orderId)
            setTimeout(() => setDriverNotifiedOrderId(null), 4000)
        }
    }
    const handleDeclineOrder = (orderId) => updateOrderStatus(orderId, 'cancelled')
    const handleMarkReady = (orderId) => updateOrderStatus(orderId, 'ready')

    const handleShare = async (product) => {
        const shareTitle = `Check out this ${product.name} on Construction Marketplace!`;
        const shareText = product.description;
        const shareUrl = `${window.location.origin}/products/${product.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                showNotification('Link copied to clipboard!', 'success', 'You can now paste it into WhatsApp.')
            } catch (err) {
                console.error('Clipboard error:', err);
                showNotification('Shared link: ' + shareUrl, 'info')
            }
        }
    }

    const calculatedTotalOrders = supplierOrders.length || 0;

    const { calculatedTotalRevenue, pendingClearance, availableWithdrawal } = useMemo(() => {
        return supplierOrders.reduce((acc, order) => {
            const val = Number(order.total) || Number(order.totalAmount) || 0;
            acc.calculatedTotalRevenue += val;
            if (order.status === 'new' || order.status === 'preparing') {
                acc.pendingClearance += val;
            }
            if (order.status === 'ready' || order.status === 'delivered') {
                acc.availableWithdrawal += val;
            }
            return acc;
        }, { calculatedTotalRevenue: 0, pendingClearance: 0, availableWithdrawal: 0 });
    }, [supplierOrders]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsSettingsLoading(true)
        const sid = currentUser?.$id || currentUser?.id

        try {
            // Ensure we use the latest avatar URL from state
            const finalImage = profileAvatar || supplierProfileData.image || ''
            const payload = {
                ...supplierProfileData,
                image: finalImage
            }

            if (!sid) {
                console.error('ERROR: sid is missing!', currentUser)
                showNotification('Update failed', 'error', 'User ID is missing. Please refresh.')
                return
            }

            console.log('DEBUG: Updating profile for sid:', sid)
            console.log('DEBUG: Image to persist:', finalImage)
            console.log('DEBUG: Full Payload:', payload)

            const res = await fetch(`/api/supplier/profile?supplierId=${sid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const contentType = res.headers.get('content-type')
            let data = {}
            if (contentType && contentType.includes('application/json')) {
                data = await res.json()
            } else {
                const text = await res.text()
                console.error('Non-JSON response:', text)
                throw new Error('Server returned an unexpected response format')
            }

            if (res.ok) {
                console.log('API Response receivedImage:', data.receivedImage)

                if (data.receivedImage) {
                    setProfileAvatar(data.receivedImage)
                    setSupplierProfileData(prev => ({ ...prev, image: data.receivedImage }))
                }

                showNotification(
                    'Profile updated successfully!',
                    'success',
                    data.receivedImage ? 'Cloud image persisted.' : 'Warning: Image was empty in save request.'
                )

                // Refresh to ensure everything is synced
                fetchSupplierProfile()
            } else if (res.status === 403) {
                showNotification('Profile Locked', 'info', data.message)
            } else {
                showNotification(data.message || 'Failed to update profile', 'error')
            }
        } catch (err) {
            console.error('Profile update error:', err)
            showNotification('Update failed', 'error', err.message || 'An error occurred')
        } finally {
            setIsSettingsLoading(false)
        }
    }

    const stats = {
        totalRevenue: formatCurrency(calculatedTotalRevenue),
        totalOrders: calculatedTotalOrders,
        activeProducts: products.length,
        pendingOrders: supplierOrders.filter(o => o.status === 'new').length,
    }

    // ── Early Returns for Auth/Loading ─────────────
    if (showLoadingScreen) {
        return <ConstructionLoader message="Loading" />
    }

    if (showAuthOverlay) {
        return <LoginForm role="supplier" isOverlay={false} />
    }

    return (
        <div className={styles.container}>
            {/* Toast Notifications */}
            {notification && (
                <div className={styles.toastContainer}>
                    <div className={`${styles.toast} ${styles['toast' + notification.type.charAt(0).toUpperCase() + notification.type.slice(1)]}`}>
                        <div className={styles.toastIcon}>
                            {notification.type === 'success' && '✅'}
                            {notification.type === 'info' && 'ℹ️'}
                            {notification.type === 'error' && '❌'}
                        </div>
                        <div className={styles.toastContent}>
                            <p className={styles.toastMessage}>{notification.message}</p>
                            {notification.sub && <p className={styles.toastSub}>{notification.sub}</p>}
                        </div>
                        <button className={styles.toastClose} onClick={() => setNotification(null)}>✕</button>
                    </div>
                </div>
            )}

            {/* Driver-notified Toast */}
            {
                driverNotifiedOrderId && (
                    <div style={{
                        position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
                        background: 'linear-gradient(135deg,#10b981,#059669)',
                        color: 'white', borderRadius: '1rem', padding: '1rem 1.5rem',
                        boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
                        fontWeight: 600, fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        🚚 Driver notified! They have 60 seconds to accept.
                    </div>
                )
            }

            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🏗️</span>
                        <span className={styles.logoText}>BuildMart Supplier</span>
                    </div>
                    <div className={styles.navRight}>

                        {/* Notifications Bell */}
                        <div className={styles.navIconWrap} ref={notifsRef}>
                            <button
                                className={styles.iconBtn}
                                onClick={() => { setShowNotifs(v => !v); setShowProfile(false) }}
                                title="Notifications"
                            >
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                {stats.pendingOrders > 0 && (
                                    <span className={styles.menuBadge}>{stats.pendingOrders}</span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>Notifications</div>
                                    <div className={styles.notifList}>
                                        {stats.pendingOrders > 0 ? (
                                            <div className={styles.notifItem}>
                                                <span className={styles.notifIcon}>📦</span>
                                                <div className={styles.notifBody}>
                                                    <div className={styles.notifTitle}>New Orders!</div>
                                                    <div className={styles.notifSub}>You have {stats.pendingOrders} pending orders</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.notifEmpty}>No new notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className={styles.profileSection} ref={profileRef}>
                            <button
                                className={styles.profileTrigger}
                                onClick={() => { setShowProfile(v => !v); setShowNotifs(false) }}
                            >
                                <div className={styles.avatar}>
                                    {profileAvatar ? (
                                        <img src={profileAvatar} alt="Profile" />
                                    ) : (
                                        currentUser?.name?.[0] || 'S'
                                    )}
                                </div>
                                <span className={styles.profileName}>{currentUser?.name || 'Supplier'}</span>
                                <span className={styles.chevron}>▼</span>
                            </button>

                            {showProfile && (
                                <div className={styles.dropdown}>
                                    <div className={styles.profileDropdownTop}>
                                        <div className={styles.profileAvatarLarge} onClick={handleAvatarClick}>
                                            {profileAvatar ? (
                                                <img src={profileAvatar} alt="Profile" className={styles.avatarImgLarge} />
                                            ) : (
                                                <div className={styles.avatarPlaceholderLarge}>
                                                    {currentUser?.name?.[0] || 'S'}
                                                </div>
                                            )}
                                            <div className={styles.avatarEditOverlay}>📷</div>
                                        </div>
                                        <div className={styles.profileDropdownInfo}>
                                            <div className={styles.profileDropdownName}>{currentUser?.name || 'Supplier'}</div>
                                            <div className={styles.profileDropdownEmail}>{currentUser?.email || supplierProfile.email}</div>
                                            <div className={styles.roleBadge}>Supplier Partner</div>
                                        </div>
                                    </div>
                                    <div className={styles.dropdownDivider}></div>
                                    <button className={styles.dropdownItem} onClick={() => { setActiveTab('settings'); setShowProfile(false); }}>
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px', marginRight: '8px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                    </button>
                                    <button className={styles.dropdownItem} onClick={() => { setActiveTab('help'); setShowProfile(false); }}>
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px', marginRight: '8px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                        Help Center
                                    </button>
                                    <div className={styles.dropdownDivider}></div>
                                    <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={logout}>
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px', marginRight: '8px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                {/* Sidebar Navigation */}
                <aside className={styles.sidebar}>
                    <button
                        className={`${styles.menuItem} ${activeTab === 'overview' ? styles.menuItemActive : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 19a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4zm6 0a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v10zm6 0a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v15z" />
                        </svg>
                        Overview
                    </button>
                    <button
                        className={`${styles.menuItem} ${activeTab === 'products' ? styles.menuItemActive : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
                        </svg>
                        Products
                    </button>
                    <button
                        className={`${styles.menuItem} ${activeTab === 'orders' ? styles.menuItemActive : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                        Orders
                        {stats.pendingOrders > 0 && <span className={styles.menuBadge}>{stats.pendingOrders}</span>}
                    </button>
                    <button
                        className={`${styles.menuItem} ${activeTab === 'payments' ? styles.menuItemActive : ''}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2v10h10a10 10 0 1 1-10-10zm2 0a10 10 0 0 1 8 8h-8V2z" />
                        </svg>
                        Payments
                    </button>
                </aside>

                {/* Main Content Area */}
                <div className={styles.content}>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className={styles.overview}>
                            <div className={styles.welcomeSection}>
                                <div className={styles.welcomeAvatar}>
                                    {profileAvatar ? (
                                        <img src={profileAvatar} alt="Profile" />
                                    ) : (
                                        currentUser?.name?.[0] || 'S'
                                    )}
                                </div>
                                <div className={styles.welcomeInfo}>
                                    <h2>Welcome back, {supplierProfileData.supplierName || currentUser?.name || 'Partner'}!</h2>
                                    <p>
                                        Managing <span className={styles.shopTag}>{supplierProfileData.shopName || 'Your Shop'}</span>
                                        {supplierProfileData.address && ` • 📍 ${supplierProfileData.address.split(',')[0]}`}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.headerRow}>
                                <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={`${styles.statCard} ${styles.statPrimary}`} onClick={() => setActiveTab('payments')}>
                                    <div className={styles.statIcon}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className={styles.statValue}>{stats.totalRevenue}</div>
                                        <div className={styles.statLabel}>Total Revenue</div>
                                    </div>
                                </div>
                                <div className={`${styles.statCard} ${styles.statSuccess}`} onClick={() => setActiveTab('orders')}>
                                    <div className={styles.statIcon}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className={styles.statValue}>{stats.totalOrders}</div>
                                        <div className={styles.statLabel}>Total Orders</div>
                                    </div>
                                </div>
                                <div className={`${styles.statCard} ${styles.statWarning}`} onClick={() => setActiveTab('orders')}>
                                    <div className={styles.statIcon}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className={styles.statValue}>{stats.pendingOrders}</div>
                                        <div className={styles.statLabel}>Pending Orders</div>
                                    </div>
                                </div>
                                <div className={`${styles.statCard} ${styles.statInfo}`} onClick={() => setActiveTab('products')}>
                                    <div className={styles.statIcon}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className={styles.statValue}>{stats.activeProducts}</div>
                                        <div className={styles.statLabel}>Active Products</div>
                                    </div>
                                </div>
                            </div>

                            {/* --- Dashboard Widgets --- */}
                            <div className={styles.dashboardWidgets}>
                                {/* Recent Orders Panel */}
                                <div className={styles.widgetCard}>
                                    <div className={styles.widgetHeader}>
                                        <h3>Recent Orders</h3>
                                        <button className={styles.widgetAction} onClick={() => setActiveTab('orders')}>View All</button>
                                    </div>
                                    <div className={styles.widgetContent}>
                                        {supplierOrders.length === 0 ? (
                                            <div className={styles.widgetEmpty}>No orders yet.</div>
                                        ) : (
                                            <div className={styles.recentOrdersList}>
                                                {supplierOrders.slice(0, 3).map(order => (
                                                    <div key={order.id} className={styles.recentOrderItem}>
                                                        <div className={styles.recentOrderInfo}>
                                                            <div className={styles.recentOrderId}>{order.id}</div>
                                                            <div className={styles.recentOrderCustomer}>{order.customerName}</div>
                                                        </div>
                                                        <div className={styles.recentOrderMeta}>
                                                            <div className={styles.recentOrderTotal}>{formatCurrency(order.totalAmount)}</div>
                                                            <span className={`badge ${getStatusColor(order.status)}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Limited Stock Alert Panel */}
                                <div className={styles.widgetCard}>
                                    <div className={styles.widgetHeader}>
                                        <h3>Limited Stock Alerts</h3>
                                        <button className={styles.widgetAction} onClick={() => setActiveTab('products')}>Manage Inventory</button>
                                    </div>
                                    <div className={styles.widgetContent}>
                                        {products.filter(p => p.stock < 20).length === 0 ? (
                                            <div className={styles.widgetEmpty} style={{ color: '#10b981' }}>
                                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                All products are well stocked!
                                            </div>
                                        ) : (
                                            <div className={styles.lowStockList}>
                                                {products.filter(p => p.stock < 20).slice(0, 4).map(product => (
                                                    <div key={product.id} className={styles.lowStockItem}>
                                                        <div className={styles.lowStockInfo}>
                                                            <div className={styles.lowStockName}>{product.name}</div>
                                                            <div className={styles.lowStockCategory}>{product.category}</div>
                                                        </div>
                                                        <div className={styles.lowStockAmount}>
                                                            {product.stock} left
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {
                        activeTab === 'products' && (
                            <div className={styles.products}>
                                <div className={styles.headerRow}>
                                    <h1 className={styles.pageTitle}>Product Management</h1>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setNewProduct({
                                                name: '',
                                                category: 'Cement',
                                                price: '',
                                                unit: 'Bag (50kg)',
                                                minOrder: '',
                                                stock: '',
                                            })
                                            setShowAddProduct(true)
                                        }}
                                    >
                                        <span style={{ marginRight: '8px' }}>+</span> Add New Product
                                    </button>
                                </div>

                                {showAddProduct && (
                                    <div className={styles.modalOverlay}>
                                        <div className={styles.productModalCard}>
                                            <div className={styles.modalHeader}>
                                                <h2>{isEditing ? 'Update Product' : 'Add New Product'}</h2>
                                                <button className={styles.modalCloseBtn} onClick={() => setShowAddProduct(false)}>✕</button>
                                            </div>
                                            <div className={styles.modalBody}>
                                                <div className={styles.modalFormWrapper}>
                                                    <form onSubmit={handleAddProduct} className={styles.addProductForm}>
                                                        <div className={styles.imageUploadSection} onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = (e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (re) => setTempProductImage(re.target.result);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            };
                                                            input.click();
                                                        }}>
                                                            {tempProductImage ? (
                                                                <div className={styles.imagePreviewWrap}>
                                                                    <img src={tempProductImage} alt="Preview" />
                                                                    <button
                                                                        className={styles.removeImageBtn}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTempProductImage(null);
                                                                        }}
                                                                    >✕</button>
                                                                </div>
                                                            ) : (
                                                                <div className={styles.imageUploadPlaceholder}>
                                                                    <div className={styles.uploadIcon}>
                                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <p>Click to upload product image</p>
                                                                    <span>(Optional - will auto-fetch if empty)</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className={styles.formGrid}>
                                                            <div className={styles.formGroup}>
                                                                <label>Product Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={newProduct.name}
                                                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label>Category</label>
                                                                <CustomSelect
                                                                    value={newProduct.category}
                                                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                                    options={[
                                                                        'Cement', 'Bricks', 'Steel', 'Sand', 'Tiles',
                                                                        'Pipes & Plumbing', 'Doors & Windows',
                                                                        'Paint & Finishes', 'Electrical Wiring'
                                                                    ]}
                                                                    placeholder="Select Category"
                                                                />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label>Price</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder="e.g. 350"
                                                                    value={newProduct.price}
                                                                    onChange={e => {
                                                                        const val = e.target.value.replace(/[^0-9.]/g, '')
                                                                        setNewProduct({ ...newProduct, price: val })
                                                                    }}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label>Unit</label>
                                                                <CustomSelect
                                                                    value={newProduct.unit}
                                                                    onChange={e => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                                                                    options={categoryUnits[newProduct.category] || ['Pcs']}
                                                                    placeholder="Select Unit"
                                                                />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label>Stock (in {newProduct.unit})</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    value={newProduct.stock}
                                                                    onChange={e => {
                                                                        const val = e.target.value.replace(/[^0-9]/g, '')
                                                                        setNewProduct({ ...newProduct, stock: val })
                                                                    }}
                                                                    placeholder={`Enter quantity in ${newProduct.unit}`}
                                                                    required
                                                                /></div>
                                                        </div>

                                                        {/* Dynamic Category Fields */}
                                                        <div className={styles.categoryDetailsCard}>
                                                            <h3 className={styles.categoryDetailsTitle}>
                                                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                                                </svg>
                                                                Category Specific Details
                                                            </h3>
                                                            <div className={styles.formGrid}>
                                                                {/* Category dynamic fields... (omitted for brevity in prompt but I should include them all or just replace the end) */}
                                                                {/* Wait, I should include them to be safe since I'm replacing the block */}
                                                                {newProduct.category === 'Cement' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Grade Type</label>
                                                                            <CustomSelect
                                                                                value={newProduct.grade || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, grade: e.target.value })}
                                                                                options={['OPC 43 Grade', 'OPC 53 Grade', 'PPC']}
                                                                                placeholder="Select Grade"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Weight per Bag (kg)</label>
                                                                            <input type="number" placeholder="50" value={newProduct.weight || ''} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Steel' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Thickness (mm)</label>
                                                                            <CustomSelect
                                                                                value={newProduct.thickness || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, thickness: e.target.value })}
                                                                                options={['8mm', '10mm', '12mm', '16mm', '20mm', '25mm']}
                                                                                placeholder="Select Thickness"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Length per Bar (m)</label>
                                                                            <input type="number" placeholder="12" value={newProduct.length || ''} onChange={e => setNewProduct({ ...newProduct, length: e.target.value })} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Bricks' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Brick Class</label>
                                                                            <CustomSelect
                                                                                value={newProduct.brickClass || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, brickClass: e.target.value })}
                                                                                options={['First Class', 'Second Class', 'Fly Ash', 'Concrete Block']}
                                                                                placeholder="Select Class"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Sand' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Sand Type</label>
                                                                            <CustomSelect
                                                                                value={newProduct.sandType || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, sandType: e.target.value })}
                                                                                options={['River Sand', 'M-Sand (Manufactured)', 'Plastering Sand']}
                                                                                placeholder="Select Type"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Tiles' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Tile Material</label>
                                                                            <CustomSelect
                                                                                value={newProduct.tileMaterial || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, tileMaterial: e.target.value })}
                                                                                options={['Ceramic', 'Porcelain', 'Vitrified', 'Natural Stone']}
                                                                                placeholder="Select Material"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Dimensions (mm/inches)</label>
                                                                            <input type="text" placeholder="e.g. 600x600 mm" value={newProduct.dimensions || ''} onChange={e => setNewProduct({ ...newProduct, dimensions: e.target.value })} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Pipes & Plumbing' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Pipe Material</label>
                                                                            <CustomSelect
                                                                                value={newProduct.pipeMaterial || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, pipeMaterial: e.target.value })}
                                                                                options={['PVC', 'CPVC', 'UPVC', 'Cast Iron', 'Copper']}
                                                                                placeholder="Select Material"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Diameter (inch/mm)</label>
                                                                            <input type="text" placeholder="e.g. 1 inch" value={newProduct.diameter || ''} onChange={e => setNewProduct({ ...newProduct, diameter: e.target.value })} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Doors & Windows' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Material / Type</label>
                                                                            <CustomSelect
                                                                                value={newProduct.doorMaterial || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, doorMaterial: e.target.value })}
                                                                                options={['Solid Wood', 'Plywood / Flush', 'UPVC Frame', 'Aluminum Frame']}
                                                                                placeholder="Select Material"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Dimensions (H x W)</label>
                                                                            <input type="text" placeholder="e.g. 80x32 inches" value={newProduct.dimensions || ''} onChange={e => setNewProduct({ ...newProduct, dimensions: e.target.value })} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Paint & Finishes' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Paint Type</label>
                                                                            <CustomSelect
                                                                                value={newProduct.paintType || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, paintType: e.target.value })}
                                                                                options={['Emulsion (Interior/Exterior)', 'Enamel (Wood/Metal)', 'Primer', 'Distemper', 'Waterproofing']}
                                                                                placeholder="Select Type"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Volume (Liters)</label>
                                                                            <CustomSelect
                                                                                value={newProduct.volume || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, volume: e.target.value })}
                                                                                options={['1 Liter', '4 Liters', '10 Liters', '20 Liters']}
                                                                                placeholder="Select Volume"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {newProduct.category === 'Electrical Wiring' && (
                                                                    <>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Wire Type / Core</label>
                                                                            <CustomSelect
                                                                                value={newProduct.wireType || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, wireType: e.target.value })}
                                                                                options={['Single Core (House Wiring)', 'Multi Core', 'Coaxial Cable', 'Submersible Cable']}
                                                                                placeholder="Select Type"
                                                                            />
                                                                        </div>
                                                                        <div className={styles.formGroup}>
                                                                            <label>Thickness (Sq. mm)</label>
                                                                            <CustomSelect
                                                                                value={newProduct.sqmm || ''}
                                                                                onChange={e => setNewProduct({ ...newProduct, sqmm: e.target.value })}
                                                                                options={['0.75 sq. mm', '1.0 sq. mm', '1.5 sq. mm', '2.5 sq. mm', '4.0 sq. mm', '6.0 sq. mm']}
                                                                                placeholder="Select Thickness"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            <div className={styles.modalFooter}>
                                                <button className="btn btn-outline" onClick={() => setShowAddProduct(false)}>Cancel</button>
                                                <button className="btn btn-primary" onClick={() => {
                                                    const form = document.querySelector(`.${styles.addProductForm}`);
                                                    if (form) form.requestSubmit();
                                                }}>
                                                    {isEditing ? 'Update Product' : 'Save Product'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Product Grid */}
                                <div className={styles.productGrid}>
                                    {products.map((product) => (
                                        <div key={product.id} className={styles.productCard}>
                                            <button
                                                className={styles.shareButton}
                                                onClick={() => handleShare(product)}
                                                title="Share Product"
                                            >
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                                </svg>
                                            </button>
                                            <div className={styles.productImage}>
                                                {product.image && (product.image.startsWith('http') || product.image.startsWith('data:image')) ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
                                                    />
                                                ) : (
                                                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '48px', height: '48px' }}>
                                                        <path d="M32 12L14 22.5V43L32 53.5L50 43V22.5L32 12Z" fill="#D4A373" />
                                                        <path d="M50 22.5L32 33V53.5L50 43V22.5Z" fill="#B08D6A" />
                                                        <path d="M14 22.5L32 33V53.5L14 43V22.5Z" fill="#E2C19D" />
                                                        <path d="M32 12L14 22.5L32 33L50 22.5L32 12Z" fill="#FAEDCD" />
                                                        <path d="M32 33V53.5" stroke="#9C785B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M32 33L14 22.5" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M32 33L50 22.5" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={styles.productInfo}>
                                                <h3 className={styles.productName}>{product.name}</h3>
                                                <div className={styles.productMeta}>
                                                    <span className={styles.productCategory}>{product.category}</span>
                                                    <span className={styles.productRating}>⭐ {product.rating}</span>
                                                </div>
                                                <div className={styles.productPrice}>
                                                    {formatCurrency(product.price)}
                                                    <span className={styles.productUnit}>/ {product.unit}</span>
                                                </div>
                                                <div className={styles.productStock}>
                                                    Stock: <strong>{product.stock}</strong> {product.unit}
                                                </div>
                                            </div>
                                            <div className={styles.productActions}>
                                                <button className="btn btn-outline" onClick={() => handleEditProduct(product)}>Edit</button>
                                                <button
                                                    className={styles.deleteProductBtn}
                                                    onClick={() => {
                                                        setProductToDelete(product);
                                                    }}
                                                    title="Delete Product"
                                                >
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delete Confirmation Modal */}
                                {productToDelete && (
                                    <div className={styles.modalOverlay}>
                                        <div className={styles.deleteModalCard}>
                                            <div className={styles.deleteModalHeader}>
                                                <div className={styles.deleteModalIcon}>
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <h3>Delete Product</h3>
                                            </div>
                                            <p className={styles.deleteModalText}>
                                                Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action cannot be undone and it will be permanently removed from your storefront.
                                            </p>
                                            <div className={styles.deleteModalActions}>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setProductToDelete(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className={styles.deleteConfirmBtn}
                                                    onClick={async () => {
                                                        const res = await deleteProduct(productToDelete.id);
                                                        if (res && res.success) {
                                                            setProductToDelete(null);
                                                        } else {
                                                            alert(res?.message || 'Failed to delete product');
                                                        }
                                                    }}
                                                >
                                                    Delete Product
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Orders Tab */}
                    {
                        activeTab === 'orders' && (
                            <div className={styles.orders}>
                                <h1 className={styles.pageTitle}>Order Management</h1>

                                <div className={styles.ordersList}>
                                    {supplierOrders.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.emptyIcon}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                            <h3>No Orders Received Yet</h3>
                                            <p>When customers place orders for your products, they will appear here.</p>
                                        </div>
                                    ) : supplierOrders.map((order) => (
                                        <div key={order.id} className={styles.orderCardLarge}>
                                            <div className={styles.orderHeaderLarge}>
                                                <div>
                                                    <h3 className={styles.orderId}>{order.id}</h3>
                                                    <p className={styles.orderCustomer}>
                                                        👤 {order.customerName}
                                                    </p>
                                                    <p className={styles.orderAddress}>
                                                        📍 {order.deliveryAddress}
                                                    </p>
                                                </div>
                                                <span className={`badge ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>

                                            <div className={styles.orderBody}>
                                                <h4>Order Items:</h4>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className={styles.orderItemLarge}>
                                                        <span>{item.name}</span>
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={styles.orderFooterLarge}>
                                                <div className={styles.orderTotal}>
                                                    <strong>Total:</strong> {formatCurrency(order.totalAmount)}
                                                </div>
                                                <div className={styles.orderActions}>
                                                    {order.status === 'new' && (
                                                        <>
                                                            <button
                                                                className="btn btn-success"
                                                                onClick={() => handleAcceptOrder(order.id)}
                                                            >
                                                                ✓ Accept
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => handleDeclineOrder(order.id)}
                                                            >
                                                                ✗ Decline
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handleMarkReady(order.id)}
                                                        >
                                                            📦 Mark Ready for Pickup
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Payments Tab */}
                    {
                        activeTab === 'payments' && (
                            <div className={styles.payments}>
                                <div className={styles.headerRow}>
                                    <h1 className={styles.pageTitle}>Payment Settlement</h1>
                                </div>

                                {/* Payment Summary */}
                                <div className={styles.paymentGrid}>
                                    <div className={`${styles.statCard} ${styles.statWarning}`}>
                                        <div className={styles.statIcon}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className={styles.statValue}>{formatCurrency(pendingClearance)}</div>
                                            <div className={styles.statLabel}>Pending Clearance</div>
                                        </div>
                                    </div>
                                    <div className={`${styles.statCard} ${styles.statPrimary}`}>
                                        <div className={styles.statIcon}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className={styles.statValue}>{formatCurrency(availableWithdrawal)}</div>
                                            <div className={styles.statLabel}>Available to Withdraw</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Options */}
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Withdraw Funds</h2>
                                    <div className={styles.payoutOptions}>
                                        <button className="btn btn-primary">
                                            Standard Payout (2-3 days)
                                        </button>
                                        <button className="btn btn-success">
                                            Instant Payout (1% fee)
                                        </button>
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Transaction History</h2>
                                    <div className={styles.transactionList}>
                                        {supplierOrders.length === 0 ? (
                                            <div className={styles.widgetEmpty} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                                No transactions recorded yet.
                                            </div>
                                        ) : (
                                            supplierOrders.map(order => (
                                                <div key={order.id} className={styles.transaction}>
                                                    <div>
                                                        <div className={styles.transactionId}>{order.id}</div>
                                                        <div className={styles.transactionDate}>{formatDate(order.date)}</div>
                                                    </div>
                                                    <div className={styles.transactionAmount}>+ {formatCurrency(order.totalAmount)}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Help Center Tab */}
                    {activeTab === 'help' && (
                        <div className={styles.help}>
                            <h1 className={styles.pageTitle} style={{ textAlign: 'center', marginBottom: '2rem' }}>Help Center & FAQs</h1>

                            <div className={styles.helpCenter}>
                                {[
                                    {
                                        q: "How do I add a new product to my store?",
                                        a: "Navigate to the 'Products' tab using the left sidebar. Click the blue '+ Add New Product' button in the top right. Fill out the item name, category, price, and stock levels. You can optionally upload your own product photo, otherwise our system will automatically find a high-quality image based on the category."
                                    },
                                    {
                                        q: "Why isn't my profile image saving?",
                                        a: "We enforce a strict 30-day lock period on profile identities (Name, Shop Name, Photo) to prevent fraud and ensure customer trust. If you recently updated your profile, you must wait 30 days before making another change."
                                    },
                                    {
                                        q: "How do I process an order?",
                                        a: "Click on the 'Orders' tab. New orders appear as 'Pending'. Click 'Accept' to confirm you have the inventory. Once you have prepared the physical materials for the driver to collect, click 'Mark Ready for Pickup'. The app will instantly notify the assigned delivery driver."
                                    },
                                    {
                                        q: "When will I get paid for closed orders?",
                                        a: "For completed and delivered orders, the funds are held securely in escrow. Settlements run every Tuesday. You can track your pending payouts and historical transactions in the 'Payments' tab."
                                    },
                                    {
                                        q: "Can customers see all my inventory?",
                                        a: "Yes! Any product you list immediately becomes searchable to all local customers using the BuildMart app. They can search by your specific shop name or by the material type you categorized."
                                    }
                                ].map((faq, idx) => (
                                    <div key={idx} className={styles.faqItem}>
                                        <button
                                            className={`${styles.faqQuestion} ${activeFaq === idx ? styles.active : ''}`}
                                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                        >
                                            {faq.q}
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div className={`${styles.faqAnswer} ${activeFaq === idx ? styles.open : ''}`}>
                                            <p>{faq.a}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className={styles.settings}>
                            <div className={styles.headerRow}>
                                <h1 className={styles.pageTitle}>Profile Settings</h1>
                            </div>

                            <div className={styles.settingsLayout}>
                                <div className={styles.settingsSidebar}>
                                    <div className={styles.settingsAvatarCard}>
                                        <div className={styles.profileAvatarExtraLarge} onClick={handleAvatarClick}>
                                            {profileAvatar ? (
                                                <img src={profileAvatar} alt="Profile" className={styles.avatarImgLarge} />
                                            ) : (
                                                <div className={styles.avatarPlaceholderLarge}>
                                                    {currentUser?.name?.[0] || 'S'}
                                                </div>
                                            )}
                                            <div className={styles.avatarEditOverlay}>Change Photo</div>
                                        </div>
                                        <h3>{supplierProfileData.supplierName || currentUser?.name || 'Partner Name'}</h3>
                                        <p>{currentUser?.email}</p>
                                    </div>

                                    {supplierProfileData.lastUpdated && (
                                        <div className={styles.updateNotice}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Last updated: {new Date(supplierProfileData.lastUpdated).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.settingsContent}>
                                    <form onSubmit={handleUpdateProfile} className={styles.settingsForm}>
                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label>Supplier Name</label>
                                                <input
                                                    type="text"
                                                    value={supplierProfileData.supplierName}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setSupplierProfileData(prev => ({ ...prev, supplierName: val }));
                                                    }}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Shop Name</label>
                                                <input
                                                    type="text"
                                                    value={supplierProfileData.shopName}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setSupplierProfileData(prev => ({ ...prev, shopName: val }));
                                                    }}
                                                    placeholder="Enter your business name"
                                                    required
                                                />
                                            </div>
                                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                <label>Shop Address</label>
                                                <textarea
                                                    value={supplierProfileData.address}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setSupplierProfileData(prev => ({ ...prev, address: val }));
                                                    }}
                                                    placeholder="Enter full business address"
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formActions}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isSettingsLoading || isUploading}
                                            >
                                                {isSettingsLoading ? 'Saving...' : (isUploading ? 'Uploading...' : 'Save Settings')}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => setActiveTab('overview')}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>

                                    <div className={styles.settingsHelp}>
                                        <h4>Important Privacy Notice</h4>
                                        <p>To ensure platform integrity, profile details can only be updated <strong>once every 30 days</strong>. Please verify all information before saving.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
}
