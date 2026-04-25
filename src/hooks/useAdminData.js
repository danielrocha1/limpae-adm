import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { requestJson } from "../lib/api";
import { normalizeArray } from "../lib/formatters";
import { mockCollections } from "../lib/mockData";
import { resourceByKey } from "../resources";

export function useAdminData(resourceKey) {
  const resource = resourceByKey[resourceKey];
  const { logout, token } = useAuth();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ source: "api", count: 0 });

  async function load() {
    setLoading(true);
    setError("");

    try {
      const payload = await requestJson(resource.endpoint, {
        token,
        useApiBase: resource.useApiBase,
      });

      const hydratedPayload = resource.hydrate
        ? await resource.hydrate(payload, { requestJson, token })
        : payload;

      const items = resource.transform
        ? resource.transform(hydratedPayload)
        : normalizeArray(hydratedPayload);

      console.log(`[limpae-admin] Real data loaded for ${resourceKey}:`, items.length, "items");

      setData(items);
      setMeta({ source: "api", count: items.length });
    } catch (requestError) {
      console.error(`[limpae-admin] Failed to fetch ${resourceKey}:`, requestError);
      
      if (String(requestError.message).toLowerCase().includes("token")) {
        logout();
        return;
      }

      // No fallback to mock data anymore to be transparent
      setData([]);
      setMeta({ source: "error", count: 0 });
      setError(requestError.message || "Falha ao buscar dados do servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [resourceKey]);

  return { data, error, loading, meta, reload: load, resource };
}
