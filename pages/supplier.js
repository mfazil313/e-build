import { useMediaQuery } from '../hooks/useMediaQuery'
import SupplierDesktop from '../components/SupplierDesktop'
import SupplierMobile from '../components/SupplierMobile'

export default function SupplierInterface() {
    const isMobile = useMediaQuery('(max-width: 768px)')

    if (isMobile === null) return null // loading state

    return isMobile ? <SupplierMobile /> : <SupplierDesktop />
}
