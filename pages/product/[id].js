import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { useApp } from '../../context/AppContext'
import ConstructionLoader from '../../components/ConstructionLoader'
import { formatCurrency, productCategories } from '../../lib/mockData'
import styles from '../../styles/ProductDetail.module.css'

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const StarIcon = ({ filled }) => (<svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)
const CartIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>)
const ChevronDown = ({ open }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>)
const ShareIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>)
const HeartIcon = ({ active }) => (<svg width="17" height="17" viewBox="0 0 24 24" fill={active ? '#dc2626' : 'none'} stroke={active ? '#dc2626' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>)
const TruckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>)
const ShieldIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>)
const RefreshIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>)
const BackIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>)
const CheckCircle = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>)
const LocationIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>)

// Product illustration fallback
function ProductIllustration({ category, size = 120 }) {
    const colors = { Cement: '#d4a373', Bricks: '#e07a5f', Sand: '#e9c46a', Steel: '#60a5fa', Tools: '#6b7280' }
    const c = colors[category] || '#60a5fa'
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={c} stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    )
}

// Collapsible accordion section
function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className={styles.accordion}>
            <button className={styles.accordionBtn} onClick={() => setOpen(o => !o)}>
                <span>{title}</span>
                <ChevronDown open={open} />
            </button>
            {open && <div className={styles.accordionBody}>{children}</div>}
        </div>
    )
}

// Category-specific product details
const categoryDetails = {
    Cement: {
        highlights: ['Portland Pozzolana Cement (PPC)', 'High compressive strength', 'Better workability and finish', 'Resistant to sulphate attack', 'Ideal for general construction, masonry, plastering'],
        description: 'A high-performance Portland Pozzolana Cement designed for all types of construction work. The fly-ash content improves workability and provides a finer finish. It is especially suitable for use in areas exposed to dampness and coastal environments.',
        specs: [['Type', 'PPC (Portland Pozzolana Cement)'], ['Grade', '53 Grade'], ['Weight', '50 Kg / Bag'], ['Setting Time', '30 min initial, 600 min final'], ['Compressive Strength (3 days)', '≥ 16 MPa'], ['Compressive Strength (28 days)', '≥ 33 MPa']],
        faqs: [['What is this cement used for?', 'Ideal for all types of RCC construction, plastering, masonry work, and general applications.'], ['How many bags are needed per cubic metre of concrete?', 'Approximately 6–8 bags (50 kg each) per cubic metre for M20 grade concrete.'], ['What is the shelf life?', '3 months from the date of manufacture if stored properly in a dry place.']],
    },
    Bricks: {
        highlights: ['Standard IS: 1077 compliant', 'Uniform shape and size', 'High compressive strength', 'Low water absorption (<15%)', 'Excellent thermal insulation'],
        description: 'First-class red clay bricks manufactured under controlled firing conditions to ensure uniformity in size, shape and compressive strength. Suitable for all loadbearing and non-loadbearing masonry walls.',
        specs: [['Size', '190 × 90 × 90 mm'], ['Standard', 'IS 1077'], ['Compressive Strength', '≥ 7.5 MPa'], ['Water Absorption', '< 15%'], ['Class', 'First Class']],
        faqs: [['How many bricks per square metre?', 'Approximately 50 bricks per sq. metre for a 9-inch wall.'], ['Are these machine-made?', 'Yes, extruded machine-made bricks for uniform dimensions.']],
    },
    Sand: {
        highlights: ['Natural river sand — clean & washed', 'Silt content < 5%', 'Suitable for concrete, plastering & masonry', 'Well-graded particle size distribution', 'No organic impurities'],
        description: 'Naturally deposited river sand that has been washed and screened to remove silt and clay. Its well-graded particle size distribution improves workability and the final strength of concrete and mortar mixes.',
        specs: [['Type', 'River / Natural Sand'], ['Fineness Modulus', '2.6 – 3.0'], ['Silt Content', '< 5%'], ['Moisture Content', '< 4%'], ['Unit', 'Per Metric Tonne']],
        faqs: [['How much sand is needed for a cubic metre of concrete?', 'Approximately 0.44 m³ of sand per m³ of M20 concrete.']],
    },
    Steel: {
        highlights: ['Fe 500 / Fe 500D grade TMT bars', 'High yield strength', 'Excellent ductility and bendability', 'Superior bonding with concrete', 'Earthquake resistant'],
        description: 'High-strength Thermo-Mechanically Treated (TMT) steel bars conforming to IS 1786. The unique quenching process produces a tough outer layer and a soft ductile core, making them ideal for RCC construction and earthquake-resistant structures.',
        specs: [['Grade', 'Fe 500 D'], ['Standard', 'IS 1786'], ['Yield Strength', '≥ 500 MPa'], ['Tensile Strength', '≥ 545 MPa'], ['Elongation', '≥ 16%'], ['Weight per Rod', '~5 Kg / 6 m rod']],
        faqs: [['What diameter options are available?', '8mm, 10mm, 12mm, 16mm, 20mm, 25mm available on request.'], ['Can I order custom lengths?', 'Yes, custom cutting available for bulk orders.']],
    },
    Tools: {
        highlights: ['Professional grade quality', 'Ergonomic design for reduced fatigue', 'Hardened steel construction', 'Corrosion resistant finish', 'Suitable for heavy-duty site work'],
        description: 'A comprehensive range of professional construction hand tools built to withstand the demands of active construction sites. All tools are manufactured from high-grade carbon steel with anti-rust coating for long service life.',
        specs: [['Material', 'High Carbon Steel'], ['Finish', 'Powder Coated / Chrome Plated'], ['Standard', 'IS 4170']],
        faqs: [['Do tools come with a warranty?', 'Yes, all tools carry a 6-month manufacturing defect warranty.']],
    },
}

export default function ProductDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const { products, isAuthenticated, authLoading, addToCart: ctxAddToCart, removeFromCart: ctxRemoveFromCart, updateCartQuantity: ctxUpdateQty, cart, rateProduct } = useApp()

    const [product, setProduct] = useState(null)
    const [imgUrl, setImgUrl] = useState(null)
    const [imgLoading, setImgLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [wishlisted, setWishlisted] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [toast, setToast] = useState('')
    const [userRating, setUserRating] = useState(0) // Local state for interactive rating
    const [hoverRating, setHoverRating] = useState(0)

    // Find product
    useEffect(() => {
        if (!id || !products.length) return
        const found = products.find(p => String(p.id) === String(id))
        setProduct(found || null)
        if (found) setQuantity(found.minOrder || 1)
    }, [id, products])

    // Fetch product image via searchImage API
    useEffect(() => {
        if (!product) return
        setImgLoading(true)
        setImgUrl(null)
        // If product already has a real image URL, use it directly
        if (product.image && typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('data:'))) {
            setImgUrl(product.image)
            setImgLoading(false)
            return
        }
        // Otherwise search for one
        const query = `${product.name} construction material product`
        fetch(`/api/searchImage?q=${encodeURIComponent(query)}`)
            .then(r => r.json())
            .then(data => { if (data.url) setImgUrl(data.url) })
            .catch(() => { })
            .finally(() => setImgLoading(false))
    }, [product])

    // Similar products: same category, excluding self
    const similar = products.filter(p => product && p.category === product.category && String(p.id) !== String(id)).slice(0, 4)

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

    const handleAddToCart = () => {
        if (!product) return
        // Use context addToCart if available
        if (typeof ctxAddToCart === 'function') {
            ctxAddToCart(product, quantity)
        }
        setAddedToCart(true)
        showToast(`${product.name} added to cart!`)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    const handleBuyNow = () => {
        handleAddToCart()
        router.push('/customer')
    }

    const handleShare = async () => {
        const url = window.location.href
        const text = `Check out ${product.name} at ${formatCurrency(product.price)} / ${product.unit} on BuildMart!\n\n${product.description || 'Great construction materials available locally.'}`
        if (navigator.share) {
            try { await navigator.share({ title: product.name, text, url }) } catch { }
        } else {
            navigator.clipboard.writeText(`${text}\n${url}`)
            showToast('Link copied to clipboard!')
        }
    }

    const StarIcon = ({ filled, onMouseEnter, onMouseLeave, onClick, style = {} }) => (
        <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill={filled ? "#fbbf24" : "none"}
            stroke={filled ? "#fbbf24" : "#94a3b8"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.1s', ...style }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    )

    const handleRate = async (rating) => {
        if (!isAuthenticated) return showToast('Please sign in to rate products')
        setUserRating(rating)
        const res = await rateProduct(product.id, rating)
        if (res.success) {
            showToast('Thank you for your rating!')
        } else {
            showToast('Failed to save rating. Please try again.')
        }
    }

    const renderStars = (r = 4, interactive = false) => Array.from({ length: 5 }, (_, i) => {
        const ratingValue = i + 1;
        return (
            <StarIcon
                key={i}
                filled={interactive ? ratingValue <= (hoverRating || userRating || r) : ratingValue <= Math.floor(r)}
                onMouseEnter={interactive ? () => setHoverRating(ratingValue) : undefined}
                onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                onClick={interactive ? () => handleRate(ratingValue) : undefined}
                style={interactive && hoverRating === ratingValue ? { transform: 'scale(1.15)' } : {}}
            />
        )
    })

    if (authLoading || (!product && products.length === 0)) return <ConstructionLoader message="Loading product…" />

    if (!product && products.length > 0) {
        return (
            <div className={styles.notFound}>
                <h2>Product not found</h2>
                <Link href="/customer" className={styles.backLink}><BackIcon /> Back to Shop</Link>
            </div>
        )
    }

    if (!product) return <ConstructionLoader message="Loading product…" />

    const details = categoryDetails[product.category] || categoryDetails.Tools

    return (
        <div className={styles.page}>
            <Head>
                <title>{product.name} | BuildMart</title>
                <meta name="description" content={product.description || `Buy ${product.name} for ${formatCurrency(product.price)} on BuildMart.`} />
                <meta property="og:title" content={`${product.name} - BuildMart`} />
                <meta property="og:description" content={product.description || `Get ${product.name} starting at ${formatCurrency(product.price)}/${product.unit} on BuildMart.`} />
                {imgUrl && <meta property="og:image" content={imgUrl} />}
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : `https://buildmart.com/product/${product.id}`} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={product.name} />
                <meta name="twitter:description" content={product.description} />
                {imgUrl && <meta name="twitter:image" content={imgUrl} />}
            </Head>

            {/* Toast */}
            {toast && <div className={styles.toast}>{toast}</div>}

            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navInner}>
                    <Link href="/customer" className={styles.navLogo}>
                        <span className={styles.logoEmoji}>🏗️</span>
                        <span className={styles.logoText}>BuildMart</span>
                    </Link>
                    <div className={styles.breadcrumb}>
                        <Link href="/customer">Shop</Link>
                        <span>/</span>
                        <Link href={`/customer?category=${product.category}`}>{product.category}</Link>
                        <span>/</span>
                        <span className={styles.breadcrumbCurrent}>{product.name}</span>
                    </div>
                </div>
            </nav>

            {/* Back button */}
            <div className={styles.backRow}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <BackIcon /> Back to results
                </button>
            </div>

            {/* Main product section */}
            <div className={styles.container}>
                <div className={styles.productLayout}>

                    {/* ── LEFT: Image panel ─────────────────────────── */}
                    <div className={styles.imagePanel}>
                        <div className={styles.mainImageWrap}>
                            {imgLoading ? (
                                <div className={styles.imgSkeleton}>
                                    <div className={styles.skeletonPulse} />
                                </div>
                            ) : imgUrl ? (
                                <img
                                    src={imgUrl}
                                    alt={product.name}
                                    className={styles.mainImage}
                                    onError={() => setImgUrl(null)}
                                />
                            ) : (
                                <div className={styles.imgFallback}>
                                    <ProductIllustration category={product.category} size={160} />
                                </div>
                            )}

                            {/* Badges on image */}
                            {product.stock > 0 && product.stock < 20 && (
                                <span className={styles.imgBadge} style={{ background: '#fef3c7', color: '#92400e' }}>Low Stock</span>
                            )}
                        </div>

                        {/* Thumbnails row (decorative — same image with different tint) */}
                        <div className={styles.thumbRow}>
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`${styles.thumb} ${i === 0 ? styles.thumbActive : ''}`}>
                                    {imgUrl ? <img src={imgUrl} alt="" className={styles.thumbImg} /> : <ProductIllustration category={product.category} size={36} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Info panel ─────────────────────────── */}
                    <div className={styles.infoPanel}>
                        {/* Category pill */}
                        <span className={styles.catPill}>{product.category}</span>

                        <h1 className={styles.productName}>{product.name}</h1>

                        {/* Rating row (Interactive) */}
                        <div className={styles.ratingRow} style={{ alignItems: 'center' }}>
                            <div className={styles.stars} title={product.ratingCount > 0 ? "Click to rate" : "Be the first to rate!"} style={{ display: 'flex', gap: '2px' }}>
                                {renderStars(product.rating || 0, true)}
                            </div>
                            {product.ratingCount > 0 ? (
                                <>
                                    <span className={styles.ratingNum}>{(product.rating || 0).toFixed(1)}</span>
                                    <span className={styles.ratingCount}>({product.ratingCount} reviews)</span>
                                </>
                            ) : (
                                <span className={styles.ratingCount} style={{ marginLeft: '4px', fontStyle: 'italic' }}>No reviews yet. Be the first to rate!</span>
                            )}
                            <span className={styles.divider}>|</span>
                            <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                                {product.stock > 0 ? '● IN STOCK' : '● OUT OF STOCK'}
                            </span>
                        </div>

                        {/* Price */}
                        <div className={styles.priceBlock}>
                            <span className={styles.price}>{formatCurrency(product.price)}</span>
                            <span className={styles.priceUnit}>/ {product.unit}</span>
                        </div>
                        <p className={styles.gstNote}>Including 18% GST · Shipping calculated at checkout</p>

                        {/* Supplier */}
                        <div className={styles.supplierRow}>
                            <div className={styles.supplierAvatar}>{(product.supplierName || 'B')[0]}</div>
                            <div>
                                <p className={styles.supplierName}>{product.supplierName || 'BuildMart Verified Supplier'}</p>
                                <p className={styles.supplierLoc}><LocationIcon /> Mumbai, MH · Delivers in 2–4 days</p>
                            </div>
                        </div>

                        {/* Quantity — only show when NOT already in cart */}
                        {!cart.find(i => String(i.id) === String(product.id)) && (
                            <div className={styles.qtySection}>
                                <label className={styles.qtyLabel}>Quantity</label>
                                <div className={styles.qtyControl}>
                                    <button onClick={() => setQuantity(q => Math.max(product.minOrder || 1, q - 1))}>−</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                </div>
                                <span className={styles.qtyHint}>Min: {product.minOrder || 1} {product.unit}</span>
                            </div>
                        )}

                        {/* CTA buttons */}
                        {(() => {
                            const inCart = cart.find(i => String(i.id) === String(product.id))
                            if (inCart) {
                                return (
                                    <div className={styles.ctaRow} style={{ flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                            <div className={styles.qtyControl} style={{ flex: 'none' }}>
                                                <button onClick={() => {
                                                    if (inCart.quantity <= 1) ctxRemoveFromCart(product.id)
                                                    else ctxUpdateQty(product.id, inCart.quantity - 1)
                                                }}>−</button>
                                                <span>{inCart.quantity}</span>
                                                <button onClick={() => ctxUpdateQty(product.id, inCart.quantity + 1)}>+</button>
                                            </div>
                                            <span style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <CheckCircle /> In Cart · {formatCurrency(product.price * inCart.quantity)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                                            <Link href="/customer?tab=cart" className={styles.btnBuyNow} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CartIcon /> View Cart
                                            </Link>
                                            <button className={styles.btnAddCart} style={{ flex: 1 }} onClick={() => router.back()}>← Continue Shopping</button>
                                        </div>
                                    </div>
                                )
                            }
                            return (
                                <div className={styles.ctaRow}>
                                    <button
                                        className={`${styles.btnAddCart} ${addedToCart ? styles.btnAdded : ''}`}
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                    >
                                        <CartIcon />
                                        {addedToCart ? '✓ Added!' : 'Add to Cart'}
                                    </button>
                                    <button className={styles.btnBuyNow} onClick={handleBuyNow} disabled={product.stock === 0}>
                                        Buy Now
                                    </button>
                                </div>
                            )
                        })()}

                        {/* Action strip */}
                        <div className={styles.actionStrip}>
                            <button className={`${styles.actionBtn} ${wishlisted ? styles.actionBtnActive : ''}`} onClick={() => setWishlisted(w => !w)}>
                                <HeartIcon active={wishlisted} />{wishlisted ? 'Saved' : 'Save'}
                            </button>
                            <button className={styles.actionBtn} onClick={handleShare}>
                                <ShareIcon />Share
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className={styles.trustRow}>
                            <div className={styles.trustBadge}><TruckIcon /><span>Free Delivery</span></div>
                            <div className={styles.trustBadge}><ShieldIcon /><span>Quality Verified</span></div>
                            <div className={styles.trustBadge}><RefreshIcon /><span>Easy Returns</span></div>
                        </div>
                    </div>
                </div>

                {/* ── Accordions ─────────────────────────────────────────── */}
                <div className={styles.accordionSection}>
                    <Accordion title="Product Highlights" defaultOpen>
                        <ul className={styles.highlightList}>
                            {details.highlights.map((h, i) => (
                                <li key={i} className={styles.highlightItem}><CheckCircle />{h}</li>
                            ))}
                        </ul>
                    </Accordion>

                    <Accordion title="Product Description">
                        <p className={styles.descText}>{details.description}</p>
                        {details.specs && (
                            <table className={styles.specsTable}>
                                <tbody>
                                    {details.specs.map(([k, v]) => (
                                        <tr key={k}>
                                            <td className={styles.specKey}>{k}</td>
                                            <td className={styles.specVal}>{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Accordion>

                    <Accordion title="FAQs">
                        {details.faqs?.map(([q, a], i) => (
                            <div key={i} className={styles.faqItem}>
                                <p className={styles.faqQ}>Q: {q}</p>
                                <p className={styles.faqA}>A: {a}</p>
                            </div>
                        ))}
                    </Accordion>

                    <Accordion title="Returns & Exchange Policy">
                        <div className={styles.policyText}>
                            <p>Unused and unopened products may be returned within <strong>7 days</strong> of delivery. Returns are accepted only if the product is in its original packaging and condition.</p>
                            <p>To initiate a return, contact support at <strong>support@buildmart.com</strong> with your order ID and reason for return.</p>
                            <p>Bulk orders (above 50 units) are subject to a restocking fee of 10%.</p>
                        </div>
                    </Accordion>
                </div>

                {/* ── Similar Products ────────────────────────────────────── */}
                {similar.length > 0 && (
                    <section className={styles.similarSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>You may also like</h2>
                            <Link href="/customer" className={styles.seeAll}>View all →</Link>
                        </div>
                        <div className={styles.similarGrid}>
                            {similar.map(p => (
                                <Link key={p.id} href={`/product/${p.id}`} className={styles.similarCard}>
                                    <div className={styles.similarImgWrap}>
                                        {p.image && typeof p.image === 'string' && p.image.startsWith('http')
                                            ? <img src={p.image} alt={p.name} className={styles.similarImg} />
                                            : <div className={styles.similarImgFallback}><ProductIllustration category={p.category} size={70} /></div>}
                                    </div>
                                    <div className={styles.similarInfo}>
                                        <span className={styles.similarCat}>{p.category}</span>
                                        <p className={styles.similarName}>{p.name}</p>
                                        <div className={styles.similarStars}>{renderStars(p.rating)}</div>
                                        <p className={styles.similarPrice}>{formatCurrency(p.price)} <span>/ {p.unit}</span></p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
