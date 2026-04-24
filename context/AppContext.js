import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { account } from '../lib/appwrite'
import Cookies from 'js-cookie'

const AppContext = createContext()

export function AppProvider({ children }) {
    // ── Auth ──────────────────────────────────────────
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    // ── Shared product state (from DB) ────────────────
    const [products, setProducts] = useState([])
    const [deviceId, setDeviceId] = useState('')

    // ── Cart ──────────────────────────────────────────
    const [cart, setCart] = useState([])

    // ── Orders (persisted to localStorage) ───────────
    const [orders, setOrders] = useState([])

    // ── Appwrite Session Check ────────────────────────
    const checkSession = useCallback(async (retryCount = 0) => {
        try {
            console.log(`Appwrite: Checking session (attempt ${retryCount + 1})...`)
            const user = await account.get()
            console.log('Appwrite: User found:', user)

            if (user) {
                let prefs = await account.getPrefs()
                let role = prefs.role
                console.log('Appwrite: Prefs role:', role)

                const cookieRole = Cookies.get('auth-role-preference')
                console.log('Appwrite: Cookie role found:', cookieRole)

                let needPrefsUpdate = false

                if (cookieRole) {
                    // Always honor the intent form OAuth if present
                    if (role !== cookieRole) {
                        role = cookieRole
                        needPrefsUpdate = true
                    }
                    Cookies.remove('auth-role-preference')
                } else if (!role) {
                    // Infer from path as ultimate fallback
                    const path = window.location.pathname
                    if (path.includes('supplier')) role = 'supplier'
                    else if (path.includes('driver')) role = 'driver'
                    else role = 'customer'
                    console.log('Appwrite: Inferred role from path:', role)
                    needPrefsUpdate = true
                }

                if (needPrefsUpdate && role) {
                    await account.updatePrefs({ role })
                    console.log('Appwrite: Role updated in prefs to:', role)
                }

                setIsAuthenticated(true)
                setCurrentUser(user)
                setUserRole(role || 'customer')

                // Load this user's own order history
                const uid = user.$id || user.id
                loadOrdersForUser(uid)

                // Load user-scoped cart if available
                try {
                    const cartKey = userCartKey(uid)
                    const stored = localStorage.getItem(cartKey)
                    if (stored) setCart(JSON.parse(stored))
                } catch { }
            }
        } catch (error) {
            console.warn('Appwrite: Session check failed:', error.message)

            // If we just got redirected back from Auth, maybe the cookie isn't ready?
            // Try one retry after a short delay if it's the first attempt
            if (retryCount < 1 && window.location.search.includes('hash=')) {
                console.log('Appwrite: Detected OAuth return, retrying check...')
                setTimeout(() => checkSession(retryCount + 1), 500)
                return
            }

            setIsAuthenticated(false)
            setCurrentUser(null)
            setUserRole(null)
        } finally {
            setAuthLoading(false)
        }
    }, [])

    // ── Helper: user-scoped storage key ──────────────
    const userOrdersKey = (uid) => uid ? `buildmart_orders_${uid}` : 'buildmart_orders_guest'
    const userCartKey = (uid) => uid ? `buildmart_cart_${uid}` : 'buildmart_cart'

    // ── Helper: load orders for a specific user ───────
    const loadOrdersForUser = useCallback((uid) => {
        try {
            const key = userOrdersKey(uid)
            const stored = localStorage.getItem(key)
            if (stored) {
                setOrders(JSON.parse(stored))
                return
            }
            // One-time migration: if user has no scoped key, check old global key
            const legacy = localStorage.getItem('buildmart_orders')
            if (legacy) {
                const parsed = JSON.parse(legacy)
                // Migrate orders that belong to this user
                const mine = Array.isArray(parsed)
                    ? parsed.filter(o => !o.customerId || o.customerId === uid)
                    : []
                if (mine.length > 0) {
                    localStorage.setItem(key, JSON.stringify(mine))
                    setOrders(mine)
                }
            }
        } catch { }
    }, [])

    // ── Hydrate on mount ──────────────────────────────
    useEffect(() => {
        // Load or create deviceId
        let storedId = localStorage.getItem('buildmart_deviceId')
        if (!storedId) {
            storedId = `guest-${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('buildmart_deviceId', storedId)
        }
        setDeviceId(storedId)

        // Check Appwrite session instead of localStorage
        checkSession()

        // Safety timeout: Ensure loading screen doesn't hang forever
        const safetyRetry = setTimeout(() => {
            setAuthLoading(prev => {
                if (prev) {
                    console.warn('Appwrite: Session check timed out, forcing load completion')
                    return false
                }
                return false
            })
        }, 5000)

        // Load cart (user-scoped; guest cart loaded here at mount before login)
        try {
            const storedCart = localStorage.getItem('buildmart_cart')
            if (storedCart) setCart(JSON.parse(storedCart))
        } catch { }

        // Orders loaded after session check resolves (see checkSession)
        fetchProducts()
        return () => clearTimeout(safetyRetry)
    }, [checkSession]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── CROSS-TAB SYNC ────────────────────────────────
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'buildmart_orders') {
                try {
                    const updated = JSON.parse(e.newValue)
                    setOrders(updated || [])
                } catch { }
            }
            // For Appwrite, we might rely on the SDK or cookies, 
            // but we'll monitor 'appwrite_auth_sync' for manual logout across tabs
            if (e.key === 'appwrite_logout_sync') {
                setIsAuthenticated(false)
                setCurrentUser(null)
                setUserRole(null)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    // ── Persist to user-scoped localStorage ──────────
    useEffect(() => {
        const uid = currentUser?.$id || currentUser?.id
        localStorage.setItem(userCartKey(uid), JSON.stringify(cart))
    }, [cart, currentUser])

    useEffect(() => {
        const uid = currentUser?.$id || currentUser?.id
        if (!uid) return // don't overwrite scoped data with empty state during boot
        localStorage.setItem(userOrdersKey(uid), JSON.stringify(orders))
    }, [orders, currentUser])

    // ── Auth ──────────────────────────────────────────
    const login = async (email, password, role) => {
        try {
            const cleanEmail = email.trim()
            // Pre-login cleanup: try to delete any existing session to avoid conflict
            try {
                await account.deleteSession('current')
            } catch (e) {
                // Ignore errors if no session exists
            }

            await account.createEmailPasswordSession(cleanEmail, password)
            const user = await account.get()
            const prefs = await account.getPrefs()

            // If they are logging in with a specific role, update it in prefs if not set
            const finalRole = role || prefs.role || 'customer'
            if (role && prefs.role !== role) {
                await account.updatePrefs({ role })
            }

            setIsAuthenticated(true)
            setCurrentUser(user)
            setUserRole(finalRole)

            // Load this user's persisted order history + cart
            const uid = user.$id || user.id
            loadOrdersForUser(uid)
            try {
                const stored = localStorage.getItem(userCartKey(uid))
                if (stored) setCart(JSON.parse(stored))
            } catch { }

            return { success: true }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    const loginWithSession = (user) => {
        setIsAuthenticated(true)
        setUserRole(user.role)
        setCurrentUser(user)
        // Load persisted data for this session user
        const uid = user.$id || user.id
        if (uid) {
            loadOrdersForUser(uid)
            try {
                const stored = localStorage.getItem(userCartKey(uid))
                if (stored) setCart(JSON.parse(stored))
            } catch { }
        }
    }

    const register = async (userData) => {
        try {
            const { email, password, name, role } = userData
            await account.create('unique()', email, password, name)
            await account.createEmailPasswordSession(email, password)
            await account.updatePrefs({ role })

            const user = await account.get()
            setIsAuthenticated(true)
            setUserRole(role)
            setCurrentUser(user)
            return { success: true }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    const logout = async () => {
        try {
            await account.deleteSession('current')
            setIsAuthenticated(false)
            setUserRole(null)
            setCurrentUser(null)
            setOrders([])   // clear from state — data is still in user-scoped key
            setCart([])
            localStorage.setItem('appwrite_logout_sync', Date.now().toString())
        } catch (error) {
            console.error('Logout failed:', error.message)
        }
    }

    // ── Products ──────────────────────────────────────
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products')
            const contentType = res.headers.get('content-type') || ''
            if (!contentType.includes('application/json')) return
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        }
    }

    const addProduct = async (product) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            })
            const contentType = res.headers.get('content-type') || ''
            if (!contentType.includes('application/json')) return { success: false, message: 'Server error' }
            if (res.ok) {
                const newProduct = await res.json()
                setProducts(prev => [newProduct, ...prev])
                return { success: true }
            }
            const errData = await res.json()
            return { success: false, message: errData.message || 'Failed to add product' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    const updateProduct = async (productId, updates) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p))
                return { success: true }
            }
            return { success: false, message: 'Failed to update product' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    const rateProduct = async (productId, rating) => {
        try {
            // Optimistic UI update (simple averting for visual feedback)
            setProducts(prev => prev.map(p => {
                if (p.id !== productId) return p
                const oldRating = p.rating || 0
                const oldCount = p.ratingCount || 0
                const newCount = oldCount + 1
                const newRating = ((oldRating * oldCount) + rating) / newCount
                return { ...p, rating: Number(newRating.toFixed(1)), ratingCount: newCount }
            }))

            // Send flat rating to backend, let DB calculate the true average
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating })
            })

            if (!res.ok) {
                // Revert if failed
                fetchProducts()
                return { success: false, message: 'Failed to save rating' }
            }

            // Sync with authoritative backend calculation
            const data = await res.json()
            if (data.success && data.newRating !== undefined) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, rating: data.newRating, ratingCount: data.newCount } : p))
            }
            return { success: true }
        } catch (error) {
            console.error(error)
            return { success: false, message: error.message }
        }
    }

    const deleteProduct = async (productId) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId))
                return { success: true }
            }
            return { success: false, message: 'Failed to delete product' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // ── Cart ──────────────────────────────────────────
    const addToCart = (product, quantity) => {
        const existing = cart.find(item => item.id === product.id)
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            ))
        } else {
            setCart([...cart, { ...product, quantity }])
        }
    }

    const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId))

    const updateCartQuantity = (productId, quantity) => {
        setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item))
    }

    const clearCart = () => setCart([])

    // ── Orders ────────────────────────────────────────
    const createOrder = (orderData) => {
        const uid = currentUser?.$id || currentUser?.id  // Appwrite uses $id
        const newOrder = {
            ...orderData,
            id: `ORD-${Date.now()}`,
            customerId: uid,
            customerName: currentUser?.name || currentUser?.company || 'Customer',
            customerPhone: currentUser?.phone || '',
            createdAt: new Date().toISOString(),
            status: 'new',
            supplierId: orderData.items?.[0]?.supplierId || null,
        }
        setOrders(prev => [newOrder, ...prev])
        clearCart()
        return newOrder
    }

    const updateOrderStatus = (orderId, status, extra = {}) => {
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status, ...extra } : o
        ))
    }

    // ── DELIVERY JOBS ─────────────────────────────────
    // A Tempo order becomes a driver job as soon as the supplier ACCEPTS it
    // (status: 'preparing') — driver doesn't have to wait for "Mark Ready"
    const deliveryJobs = orders.filter(
        o => o.deliveryMethod === 'tempo' &&
            (o.status === 'preparing' || o.status === 'ready') &&
            !o.rejectedBy?.includes(currentUser?.id || deviceId)
    )

    // Driver accepts the job within 60 seconds
    const claimDeliveryJob = (orderId, driverName, driverPhone = '') => {
        setOrders(prev => prev.map(o =>
            o.id === orderId
                ? { ...o, status: 'in_transit', driverName, driverPhone, driverAcceptedAt: new Date().toISOString() }
                : o
        ))
    }

    // 60s timer expired — reset order so the next driver sees it
    const rejectDeliveryJob = (orderId, driverId) => {
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o
            const rejectedBy = o.rejectedBy || []
            // If already rejected by this driver (shouldn't happen if filtered), don't duplicate
            if (driverId && !rejectedBy.includes(driverId)) {
                rejectedBy.push(driverId)
            }
            return {
                ...o,
                status: 'preparing',
                driverRejectedAt: new Date().toISOString(),
                rejectedBy
            }
        }))
    }

    const value = {
        // Auth
        isAuthenticated, userRole, currentUser, authLoading, login, register, logout, loginWithSession,
        // Products
        products, addProduct, updateProduct, deleteProduct, fetchProducts, rateProduct,
        // Cart
        cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
        // Orders
        orders, createOrder, updateOrderStatus,
        // Driver delivery jobs
        deliveryJobs, claimDeliveryJob, rejectDeliveryJob, deviceId,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) throw new Error('useApp must be used within AppProvider')
    return context
}
