import { run, get, query } from '../../../lib/db'
import fs from 'fs'
import path from 'path'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const logPath = path.resolve(process.cwd(), 'api_debug.log')
        fs.appendFileSync(logPath, `${new Date().toISOString()} - PUT: ${JSON.stringify(req.body)}\n`)
    }
    // Initialize table if it doesn't exist
    await run(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id TEXT PRIMARY KEY,
            "supplierName" TEXT,
            "shopName" TEXT,
            address TEXT,
            image TEXT,
            "lastUpdated" TEXT
        )
    `)

    const { supplierId } = req.query

    if (!supplierId) {
        return res.status(400).json({ message: 'Supplier ID is required' })
    }

    if (req.method === 'GET') {
        try {
            const profile = await get('SELECT * FROM suppliers WHERE id = ?', [supplierId])
            if (!profile) {
                // Return default values if profile doesn't exist yet
                return res.status(200).json({
                    id: supplierId,
                    supplierName: '',
                    shopName: '',
                    address: '',
                    image: '',
                    lastUpdated: null
                })
            }
            return res.status(200).json(profile)
        } catch (error) {
            console.error('Fetch supplier profile error:', error)
            return res.status(500).json({ message: 'Error fetching profile' })
        }
    }

    if (req.method === 'PUT') {
        console.log('API: Received profile update request:', req.body)
        let { supplierName, shopName, address, image } = req.body
        image = image || '' // Force to empty string if null or undefined
        const now = new Date()

        try {
            const profile = await get('SELECT "lastUpdated" FROM suppliers WHERE id = ?', [supplierId])

            if (profile && profile.lastUpdated) {
                const lastUpdate = new Date(profile.lastUpdated)
                const diffTime = Math.abs(now - lastUpdate)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                const diffHours = Math.abs(now - lastUpdate) / (1000 * 60 * 60)

                // Allow a 24-hour grace period for corrections
                if (diffDays < 30 && diffHours > 24) {
                    return res.status(403).json({
                        message: `Profile locked for 30 days. Next update allowed in ${30 - diffDays} days.`,
                        daysRemaining: 30 - diffDays
                    })
                }
            }

            const isoNow = now.toISOString()

            // Use INSERT OR REPLACE for easier handling
            await run(`
                INSERT INTO suppliers (id, "supplierName", "shopName", address, image, "lastUpdated")
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    "supplierName" = excluded."supplierName",
                    "shopName" = excluded."shopName",
                    address = excluded.address,
                    image = excluded.image,
                    "lastUpdated" = excluded."lastUpdated"
            `, [supplierId, supplierName, shopName, address, image, isoNow])

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                lastUpdated: isoNow,
                receivedImage: image
            })
        } catch (error) {
            console.error('Update supplier profile error:', error)
            return res.status(500).json({ message: 'Error updating profile' })
        }
    }

    return res.status(405).json({ message: 'Method not allowed' })
}
