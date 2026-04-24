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

    // ── Orders (server-persisted + localStorage cache) ─
    const [orders, setOrders] = useState([])

    // ── Appwrite Session Check ────────────────────────
    const checkSession = useCallback(async (retryCount = 0) => {
        try {
            console.log(`Appwrite: Checking session (attempt ${retryCount + 1})...`)
            const user = await account.get()

            if (user) {
                let prefs = {}
                try {
                    prefs = await account.getPrefs()
                } catch (e) {
                    console.warn('Appwrite: Could not fetch prefs:', e.message)
                }
                let role = prefs.role

                const cookieRole = Cookies.get('auth-role-preference')

                let needPrefsUpdate = false

                if (cookieRole) {
                    if (role !== cookieRole) {
                        role = cookieRole
                        needPrefsUpdate = true
                    }
                    Cookies.remove('auth-role-preference')
                } else if (!role) {
                    const path = window.location.pathname
                    if (path.includes('supplier')) role = 'supplier'
                    else if (path.includes('driver')) role = 'driver'
                    else role = 'customer'
                    needPrefsUpdate = true
                }

                if (needPrefsUpdate && role) {
                    try {
                        await account.updatePrefs({ role })
                    } catch (e) {
                        console.warn('Appwrite: Could not update prefs:', e.message)
                    }
                }

                setIsAuthenticated(true)
                setCurrentUser(user)
                setUserRole(role || 'customer')

                // Load this user's data
                const uid = user.$id || user.id
                loadOrdersForUser(uid)
                fetchOrdersFromAPI(uid)

                try {
                    const cartKey = userCartKey(uid)
                    const stored = localStorage.getItem(cartKey)
                    if (stored) setCart(JSON.parse(stored))
                } catch { }
            }
        } catch (error) {
            console.warn('Appwrite: Session check failed:', error.message)

            if (retryCount < 1 && window.location.search.includes('hash=')) {
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

    // ── Helper: load orders from localStorage (offline cache) ───
    const loadOrdersForUser = useCallback((uid) => {
        try {
            const key = userOrdersKey(uid)
            const stored = localStorage.getItem(key)
            if (stored) {
                setOrders(JSON.parse(stored))
                return
            }
            // One-time migration from old global key
            const legacy = localStorage.getItem('buildmart_orders')
            if (legacy) {
                const parsed = JSON.parse(legacy)
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

    // ── Helper: fetch orders from API (server source of truth) ───
    const fetchOrdersFromAPI = useCallback(async (uid) => {
        if (!uid) return
        try {
            const res = await fetch(`/api/orders?customerId=${uid}`)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data) && data.length > 0) {
                    setOrders(prev => {
                        // Merge: API orders take precedence, keep local-only orders
                        const apiIds = new Set(data.map(o => o.id))
                        const localOnly = prev.filter(o => !apiIds.has(o.id))
                        const merged = [...data, ...localOnly]
                        return merged
                    })
                }
            }
        } catch (err) {
            console.warn('Could not fetch orders from API:', err.message)
        }
    }, [])

    // ── Hydrate on mount ──────────────────────────────
    useEffect(() => {
        let storedId = localStorage.getItem('buildmart_deviceId')
        if (!storedId) {
            storedId = `guest-${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('buildmart_deviceId', storedId)
        }
        setDeviceId(storedId)

        checkSession()

        const safetyRetry = setTimeout(() => {
            setAuthLoading(prev => {
                if (prev) {
                    console.warn('Appwrite: Session check timed out, forcing load completion')
                    return false
                }
                return false
            })
        }, 5000)

        try {
            const storedCart = localStorage.getItem('buildmart_cart')
            if (storedCart) setCart(JSON.parse(storedCart))
        } catch { }

        fetchProducts()
        return () => clearTimeout(safetyRetry)
    }, [checkSession])

    // ── CROSS-TAB SYNC ────────────────────────────────
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key && e.key.startsWith('buildmart_orders_')) {
                try {
                    const updated = JSON.parse(e.newValue)
                    setOrders(updated || [])
                } catch { }
            }
            if (e.key === 'appwrite_logout_sync') {
                setIsAuthenticated(false)
                setCurrentUser(null)
                setUserRole(null)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    // ── Persist cart to localStorage ──────────────────
    useEffect(() => {
        const uid = currentUser?.$id || currentUser?.id
        localStorage.setItem(userCartKey(uid), JSON.stringify(cart))
    }, [cart, currentUser])

    // ── Persist orders to localStorage (cache) ───────
    useEffect(() => {
        const uid = currentUser?.$id || currentUser?.id
        if (!uid) return
        localStorage.setItem(userOrdersKey(uid), JSON.stringify(orders))
    }, [orders, currentUser])

    // ── Auth ──────────────────────────────────────────
    const login = async (email, password, role) => {
        try {
            const cleanEmail = email.trim()
            try {
                await account.deleteSession('current')
            } catch (e) {
                // Ignore if no session exists
            }

            await account.createEmailPasswordSession(cleanEmail, password)
            const user = await account.get()
            let prefs = {}
            try {
                prefs = await account.getPrefs()
            } catch { }

            const finalRole = role || prefs.role || 'customer'
            if (role && prefs.role !== role) {
                try {
                    await account.updatePrefs({ role })
                } catch { }
            }

            setIsAuthenticated(true)
            setCurrentUser(user)
            setUserRole(finalRole)

            const uid = user.$id || user.id
            loadOrdersForUser(uid)
            fetchOrdersFromAPI(uid)
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
        const uid = user.$id || user.id
        if (uid) {
            loadOrdersForUser(uid)
            fetchOrdersFromAPI(uid)
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
            try {
                await account.updatePrefs({ role })
            } catch { }

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
            setOrders([])
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
            setProducts(prev => prev.map(p => {
                if (p.id !== productId) return p
                const oldRating = p.rating || 0
                const oldCount = p.ratingCount || 0
                const newCount = oldCount + 1
                const newRating = ((oldRating * oldCount) + rating) / newCount
                return { ...p, rating: Number(newRating.toFixed(1)), ratingCount: newCount }
            }))

            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating })
            })

            if (!res.ok) {
                fetchProducts()
                return { success: false, message: 'Failed to save rating' }
            }

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

    // ── Orders (now server-persisted) ─────────────────
    const createOrder = async (orderData) => {
        const uid = currentUser?.$id || currentUser?.id
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

        // Update state immediately (optimistic)
        setOrders(prev => [newOrder, ...prev])
        clearCart()

        // Persist to server in background
        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            })
        } catch (err) {
            console.warn('Failed to persist order to server:', err.message)
            // Order is still in localStorage as fallback
        }

        return newOrder
    }

    const updateOrderStatus = async (orderId, status, extra = {}) => {
        // Update state immediately
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status, ...extra } : o
        ))

        // Persist to server
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...extra })
            })
        } catch (err) {
            console.warn('Failed to update order on server:', err.message)
        }
    }

    // ── DELIVERY JOBS ─────────────────────────────────
    const deliveryJobs = orders.filter(
        o => o.deliveryMethod === 'tempo' &&
            (o.status === 'preparing' || o.status === 'ready') &&
            !o.rejectedBy?.includes(currentUser?.id || deviceId)
    )

    const claimDeliveryJob = async (orderId, driverName, driverPhone = '') => {
        const extra = { driverName, driverPhone, driverAcceptedAt: new Date().toISOString() }
        await updateOrderStatus(orderId, 'in_transit', extra)
    }

    const rejectDeliveryJob = async (orderId, driverId) => {
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o
            const rejectedBy = [...(o.rejectedBy || [])]
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

        // Persist rejection to server
        try {
            const order = orders.find(o => o.id === orderId)
            const rejectedBy = [...(order?.rejectedBy || [])]
            if (driverId && !rejectedBy.includes(driverId)) rejectedBy.push(driverId)
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'preparing', rejectedBy })
            })
        } catch (err) {
            console.warn('Failed to persist rejection:', err.message)
        }
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
