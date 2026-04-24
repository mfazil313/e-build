import { run, query } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const products = await query('SELECT * FROM products ORDER BY created_at DESC')
            return res.status(200).json(products)
        } catch (error) {
            console.error('Fetch products error:', error)
            return res.status(500).json({ message: 'Error fetching products' })
        }
    }

    if (req.method === 'POST') {
        const { name, category, price, unit, stock, minOrder, description, image, supplierId, supplierName, supplierLocation } = req.body

        if (!name || !price || !supplierId) {
            return res.status(400).json({ message: 'Missing required fields: name, price, and supplierId are required' })
        }

        try {
            const id = uuidv4()
            const now = new Date().toISOString()

            await run(
                `INSERT INTO products (id, name, category, price, unit, stock, "minOrder", description, image, "supplierId", "supplierName", "supplierLocation", created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, name, category || 'General', price, unit || 'unit', stock || 0, minOrder || 1, description || '', image || '', supplierId, supplierName || '', supplierLocation || '', now]
            )

            const newProduct = {
                id, name, category: category || 'General', price, unit: unit || 'unit',
                stock: stock || 0, minOrder: minOrder || 1, description: description || '',
                image: image || '', supplierId, supplierName: supplierName || '',
                supplierLocation: supplierLocation || '', created_at: now,
                rating: 0, ratingCount: 0
            }

            return res.status(201).json(newProduct)
        } catch (error) {
            console.error('Create product error:', error)
            return res.status(500).json({ message: 'Error creating product' })
        }
    }

    return res.status(405).json({ message: 'Method not allowed' })
}
