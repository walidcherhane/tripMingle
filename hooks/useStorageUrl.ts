import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Custom hook to fetch a URL for a file stored in Convex storage
 * @param storageId The storage ID of the file
 * @returns An object containing the URL, loading state, and any error
 */
export const useStorageUrl = (
  storageId: Id<"_storage"> | string | undefined
) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const getUrl = useMutation(api.storage.getUrl);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!storageId) {
        setUrl(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Cast storageId to any to bypass type checking
        // This is necessary because the storageId might come from different sources
        const imageUrl = await getUrl({ storageId: storageId as any });
        setUrl(imageUrl);
      } catch (err) {
        console.error("Error fetching storage URL:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [storageId, getUrl]);

  return { url, loading, error };
};

export default useStorageUrl;
