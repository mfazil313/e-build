import Head from 'next/head'
import { useRouter } from 'next/router'
import { formatCurrency } from '../../lib/mockData'

export default function ProductDetailPage({ product }) {
    const router = useRouter()

    if (router.isFallback) {
        return <div className="p-10 text-center">Loading...</div>
    }

    if (!product) {
        return <div className="p-10 text-center">Product not found.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Head>
                <title>{product.name} | Construction Marketplace</title>
                <meta name="description" content={product.description} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description} />
                <meta property="og:image" content={product.image} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="h-64 bg-gray-50 flex items-center justify-center p-4">
                    {product.image && product.image.length > 5 ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-6xl">📦</span>
                    )}
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                                {product.category}
                            </span>
                            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-blue-600">
                                {formatCurrency(product.price)}
                            </div>
                            <div className="text-sm text-slate-400 font-medium">
                                per {product.unit}
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                        {product.description}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="text-sm text-slate-400 font-bold uppercase mb-1">Stock Available</div>
                            <div className="text-xl font-bold text-slate-800">{product.stock} {product.unit}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="text-sm text-slate-400 font-bold uppercase mb-1">Min. Order</div>
                            <div className="text-xl font-bold text-slate-800">{product.minOrder} {product.unit}</div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                                🏢
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 font-medium leading-none">Supplied by</div>
                                <div className="text-lg font-bold text-slate-800">{product.supplierName}</div>
                                {product.stock < 10 && (
                                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full mt-2 uppercase tracking-wider">
                                        Limited Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(`Hi, I'm interested in "${product.name}" from the Construction Marketplace.`))}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.552 4.197 1.602 6.03L0 24l6.137-1.611a11.82 11.82 0 005.911 1.586h.005c6.634 0 12.048-5.414 12.048-12.05a11.825 11.825 0 00-3.41-8.528z" />
                            </svg>
                            Enquire on WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => router.push('/')}
                    className="text-slate-500 hover:text-blue-600 font-bold transition-all flex items-center gap-2 mx-auto"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Marketplace
                </button>
            </div>
        </div>
    )
}

export async function getServerSideProps({ params }) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = process.env.VERCEL_URL || 'localhost:3000'

    try {
        const res = await fetch(`${protocol}://${host}/api/products/${params.id}`)
        if (res.ok) {
            const product = await res.json()
            return { props: { product } }
        }
    } catch (err) {
        console.error('getServerSideProps error:', err)
    }

    return { props: { product: null } }
}
