import { get, run } from '../../../lib/db'

export default async function handler(req, res) {
    const { id } = req.query

    if (req.method === 'GET') {
        try {
            const product = await get('SELECT * FROM products WHERE id = ?', [id])
            if (!product) {
                return res.status(404).json({ message: 'Product not found' })
            }
            return res.status(200).json(product)
        } catch (error) {
            console.error('Fetch single product error:', error)
            return res.status(500).json({ message: 'Error fetching product' })
        }
    }

    if (req.method === 'PUT') {
        try {
            // Check if this is a rating-only update
            if (Object.keys(req.body).length === 1 && req.body.rating !== undefined) {
                const { rating } = req.body

                const currentProduct = await get('SELECT rating, "ratingCount" FROM products WHERE id = ?', [id])
                if (!currentProduct) {
                    return res.status(404).json({ message: 'Product not found' })
                }

                const currentAvg = currentProduct.rating || 0
                const currentCount = currentProduct.ratingCount || 0
                const newCount = currentCount + 1
                const newAvg = ((currentAvg * currentCount) + rating) / newCount
                const finalRating = Number(newAvg.toFixed(1))

                await run('UPDATE products SET rating = ?, "ratingCount" = ? WHERE id = ?', [finalRating, newCount, id])
                return res.status(200).json({ success: true, message: 'Rating updated', newRating: finalRating, newCount })
            }

            // Full product update from supplier dashboard
            const { name, category, price, unit, stock, minOrder, description, image } = req.body
            await run(
                `UPDATE products SET name = ?, category = ?, price = ?, unit = ?, stock = ?, "minOrder" = ?, description = ?, image = ? WHERE id = ?`,
                [name, category, price, unit, stock, minOrder, description, image || '', id]
            )
            return res.status(200).json({ success: true, message: 'Product updated' })
        } catch (error) {
            console.error('Update product error:', error)
            return res.status(500).json({ message: 'Error updating product' })
        }
    }

    if (req.method === 'DELETE') {
        try {
            await run('DELETE FROM products WHERE id = ?', [id])
            return res.status(200).json({ success: true, message: 'Product deleted' })
        } catch (error) {
            console.error('Delete product error:', error)
            return res.status(500).json({ message: 'Error deleting product' })
        }
    }

    return res.status(405).json({ message: 'Method not allowed' })
}
