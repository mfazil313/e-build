export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount)
}

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export const supplierProfile = {
    id: 's1',
    name: "BuildMart Supplies",
    email: "supplier@buildmart.com",
    avatar: "🏭",
    totalRevenue: 145300,
    totalOrders: 156,
    rating: 4.8
}

export const sampleProducts = [
    {
        id: 1,
        name: "UltraTech Cement",
        category: "Cement",
        price: 450,
        unit: "bag",
        stock: 500,
        image: "🧱",
        rating: 4.8
    },
    {
        id: 2,
        name: "Red Bricks (Standard)",
        category: "Bricks",
        price: 12,
        unit: "piece",
        stock: 10000,
        image: "🧱",
        rating: 4.5
    },
    {
        id: 3,
        name: "River Sand",
        category: "Sand",
        price: 3500,
        unit: "ton",
        stock: 50,
        image: "🏜️",
        rating: 4.2
    },
    {
        id: 4,
        name: "TMT Steel Bars (12mm)",
        category: "Steel",
        price: 550,
        unit: "rod",
        stock: 200,
        image: "🏗️",
        rating: 4.9
    }
]

export const suppliers = [
    {
        id: 's1',
        name: "Eco-Friendly Cement Ltd",
        location: "Mumbai, MH",
        rating: 4.8,
        deliveryTime: "2-4 Days",
        categories: ["Cement", "Bricks"],
        image: "🏗️"
    },
    {
        id: 's2',
        name: "Standard Steel Co",
        location: "Pune, MH",
        rating: 4.6,
        deliveryTime: "3-5 Days",
        categories: ["Steel", "Tools"],
        image: "🏗️"
    }
]

export const productCategories = [
    { name: 'Cement', icon: '🧱' },
    { name: 'Bricks', icon: '🧱' },
    { name: 'Sand', icon: '🏜️' },
    { name: 'Steel', icon: '🏗️' },
    { name: 'Tools', icon: '🛠️' }
]

export const customerProfile = {
    name: "John Construction",
    email: "john@construction.com",
    savedAddresses: [
        { id: 1, label: 'Main Site', address: '123 Site Road, Sector 45, Mumbai' },
        { id: 2, label: 'Storage', address: 'Warehouse 7, Industrial Area, Pune' }
    ]
}
