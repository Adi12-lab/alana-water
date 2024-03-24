import { useState, useEffect } from 'react';

const useMediaQuery = (query: string) => {

    const [matches, setMatches] = useState(false); // Initial state can be false

    useEffect(() => {
        const mediaMatch = window.matchMedia(query);

        // Set initial state
        setMatches(mediaMatch.matches);

        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mediaMatch.addEventListener('change', handler);

        // Cleanup the event listener when the component is unmounted
        return () => mediaMatch.removeEventListener('change', handler);
    }, [query]); // Add query as a dependency to rerun the effect when query changes

    return matches;
};

export { useMediaQuery }