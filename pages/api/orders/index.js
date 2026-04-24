import { run, query } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'

// Ensure orders table exists
async function ensureOrdersTable() {
    try {
        await run(`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                "customerId" TEXT,
                "customerName" TEXT,
                "customerPhone" TEXT,
                items TEXT,
                "totalAmount" REAL,
                "deliveryAddress" TEXT,
                "deliveryMethod" TEXT,
                "paymentMethod" TEXT,
                status TEXT DEFAULT 'new',
                "supplierId" TEXT,
                "driverName" TEXT,
                "driverPhone" TEXT,
                "rejectedBy" TEXT,
                "driverAcceptedAt" TEXT,
                created_at TEXT
            )
        `)
    } catch (err) {
        // Table may already exist in PostgreSQL
        console.warn('[orders] Table init:', err.message)
    }
}

export default async function handler(req, res) {
    await ensureOrdersTable()

    if (req.method === 'GET') {
        try {
            const { customerId, supplierId, status: orderStatus } = req.query

            let sql = 'SELECT * FROM orders'
            const conditions = []
            const params = []

            if (customerId) {
                conditions.push('"customerId" = ?')
                params.push(customerId)
            }
            if (supplierId) {
                conditions.push('"supplierId" = ?')
                params.push(supplierId)
            }
            if (orderStatus) {
                conditions.push('status = ?')
                params.push(orderStatus)
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ')
            }

            sql += ' ORDER BY created_at DESC'

            const orders = await query(sql, params)

            // Parse items JSON for each order
            const parsed = orders.map(o => ({
                ...o,
                items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
                rejectedBy: typeof o.rejectedBy === 'string' && o.rejectedBy ? JSON.parse(o.rejectedBy) : o.rejectedBy || []
            }))

            return res.status(200).json(parsed)
        } catch (error) {
            console.error('Fetch orders error:', error)
            return res.status(500).json({ message: 'Error fetching orders' })
        }
    }

    if (req.method === 'POST') {
        const {
            customerId, customerName, customerPhone,
            items, totalAmount, deliveryAddress,
            deliveryMethod, paymentMethod, supplierId
        } = req.body

        if (!customerId || !items || !totalAmount) {
            return res.status(400).json({ message: 'Missing required fields: customerId, items, totalAmount' })
        }

        try {
            const id = `ORD-${Date.now()}`
            const now = new Date().toISOString()

            await run(
                `INSERT INTO orders (id, "customerId", "customerName", "customerPhone", items, "totalAmount", "deliveryAddress", "deliveryMethod", "paymentMethod", status, "supplierId", created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    customerId,
                    customerName || 'Customer',
                    customerPhone || '',
                    JSON.stringify(items),
                    totalAmount,
                    deliveryAddress || '',
                    deliveryMethod || 'pickup',
                    paymentMethod || 'cod',
                    'new',
                    supplierId || items?.[0]?.supplierId || null,
                    now
                ]
            )

            const newOrder = {
                id, customerId, customerName: customerName || 'Customer',
                customerPhone: customerPhone || '',
                items, totalAmount,
                deliveryAddress: deliveryAddress || '',
                deliveryMethod: deliveryMethod || 'pickup',
                paymentMethod: paymentMethod || 'cod',
                status: 'new',
                supplierId: supplierId || items?.[0]?.supplierId || null,
                createdAt: now, created_at: now,
                driverName: null, driverPhone: null,
                rejectedBy: []
            }

            return res.status(201).json(newOrder)
        } catch (error) {
            console.error('Create order error:', error)
            return res.status(500).json({ message: 'Error creating order' })
        }
    }

    return res.status(405).json({ message: 'Method not allowed' })
}
