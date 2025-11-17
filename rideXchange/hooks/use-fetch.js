import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      console.log("useFetch response:", response);
      
      // Check if response indicates an error
      if (response && typeof response === 'object' && response.success === false) {
        setError(new Error(response.error || "Operation failed"));
        toast.error(response.error || "Operation failed");
        setData(response);
        return response;
      }
      
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      console.error("useFetch error:", error);
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;

