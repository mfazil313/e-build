import { useMediaQuery } from '../hooks/useMediaQuery'
import CustomerDesktop from '../components/CustomerDesktop'
import CustomerMobile from '../components/CustomerMobile'
import ConstructionLoader from '../components/ConstructionLoader'

export default function CustomerInterface() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    // During SSR or initial hydration we wait for the hook to figure out the viewport
    if (isMobile === null) {
        return <ConstructionLoader message="Preparing your experience..." />
    }

    return isMobile ? <CustomerMobile /> : <CustomerDesktop />;
}
