import { useState, useEffect, useCallback } from "react";
import useAxiosPrivate from "./useAxiosPrivate";

const useFetchItems = (reqData) => {
    const [items, setItems] = useState([]);
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use useCallback so the function identity doesn't change on every render
    const fetchItems = useCallback(async (signal) => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get(reqData, { signal });
            setItems(response.data);
            setError(null);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [reqData, axiosPrivate]);

    useEffect(() => {
        const controller = new AbortController();
        if (reqData) fetchItems(controller.signal);

        return () => controller.abort();
    }, [fetchItems]); // Runs when fetchItems (and thus reqData) changes

    // Return the function so components can call it manually
    return [items, loading, error, fetchItems]; 
}

export default useFetchItems;