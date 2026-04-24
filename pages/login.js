import { useRouter } from 'next/router'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
    const router = useRouter()
    const { role } = router.query

    // Use default 'customer' if role is missing or invalid
    const activeRole = ['customer', 'supplier', 'driver'].includes(role) ? role : 'customer'

    return (
        <LoginForm role={activeRole} />
    )
}
