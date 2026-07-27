import { useEffect, useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";

const useFetchOneItem = (itemType, itemId) => {
 
   const [item ,setItem] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const axiosPrivate = useAxiosPrivate();

   useEffect(() => {
      const controller = new AbortController();

      const fetchItem = async ()=>{
         setLoading(true);
         try{
            const response = await axiosPrivate.get(`/${itemType}/${itemId}`,{
               signal:controller.signal
            });
            setItem(response.data);
            setError(null);
         }catch(error){
            console.log(error);
            setError(error);
         }finally{
            setLoading(false);
         }
      };
      if(itemType && itemId) fetchItem();

      return () => controller.abort();

   },[]);
   return [item, loading, error];
};

export default useFetchOneItem;