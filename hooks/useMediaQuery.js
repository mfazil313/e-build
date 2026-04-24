import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(null); // start null to prevent hydration mismatch

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value after mount
        setMatches(media.matches);

        const listener = () => setMatches(media.matches);

        // Support modern and legacy listeners
        if (media.addEventListener) {
            media.addEventListener('change', listener);
            return () => media.removeEventListener('change', listener);
        } else {
            media.addListener(listener);
            return () => media.removeListener(listener);
        }
    }, [query]);

    return matches;
}
