import useAxiosPrivate from "./useAxiosPrivate";
import { useNavigate } from "react-router"; 

const useDeleteItem = (endpoint,onDeleteSuccess) => { // Removed id from here
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const deleteItem = async (itemId) => { 
        // 1. Always good to double-check with the user
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (!confirmDelete) return;

        try {
            // 2. Ensure endpoint and id have a slash between them correctly
            await axiosPrivate.delete(`${endpoint}/${itemId}`);
            
            // This is what triggers the re-fetch in the UI!
            if (onDeleteSuccess) {
                onDeleteSuccess(); 
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
            // Optionally: alert("Something went wrong with the deletion.");
        }   
    }

    return deleteItem;
}

export default useDeleteItem;