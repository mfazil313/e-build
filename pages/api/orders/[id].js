import { get, run } from '../../../lib/db'

export default async function handler(req, res) {
    const { id } = req.query

    if (req.method === 'GET') {
        try {
            const order = await get('SELECT * FROM orders WHERE id = ?', [id])
            if (!order) {
                return res.status(404).json({ message: 'Order not found' })
            }
            // Parse JSON fields
            order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
            order.rejectedBy = typeof order.rejectedBy === 'string' && order.rejectedBy ? JSON.parse(order.rejectedBy) : order.rejectedBy || []
            return res.status(200).json(order)
        } catch (error) {
            console.error('Fetch order error:', error)
            return res.status(500).json({ message: 'Error fetching order' })
        }
    }

    if (req.method === 'PUT') {
        try {
            const { status, driverName, driverPhone, driverAcceptedAt, rejectedBy } = req.body

            // Build dynamic update
            const updates = []
            const params = []

            if (status !== undefined) {
                updates.push('status = ?')
                params.push(status)
            }
            if (driverName !== undefined) {
                updates.push('"driverName" = ?')
                params.push(driverName)
            }
            if (driverPhone !== undefined) {
                updates.push('"driverPhone" = ?')
                params.push(driverPhone)
            }
            if (driverAcceptedAt !== undefined) {
                updates.push('"driverAcceptedAt" = ?')
                params.push(driverAcceptedAt)
            }
            if (rejectedBy !== undefined) {
                updates.push('"rejectedBy" = ?')
                params.push(JSON.stringify(rejectedBy))
            }

            if (updates.length === 0) {
                return res.status(400).json({ message: 'No fields to update' })
            }

            params.push(id)
            const sql = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`

            await run(sql, params)
            return res.status(200).json({ success: true, message: 'Order updated' })
        } catch (error) {
            console.error('Update order error:', error)
            return res.status(500).json({ message: 'Error updating order' })
        }
    }

    return res.status(405).json({ message: 'Method not allowed' })
}
