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

      const items = resource.transform ? resource.transform(payload) : normalizeArray(payload);
      setData(items);
      setMeta({ source: "api", count: items.length });
    } catch (requestError) {
      if (String(requestError.message).toLowerCase().includes("token")) {
        logout();
        return;
      }

      const fallback = mockCollections[resourceKey] || [];
      setData(fallback);
      setMeta({ source: "mock", count: fallback.length });
      setError(requestError.message || "Falha ao buscar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [resourceKey]);

  return { data, error, loading, meta, reload: load, resource };
}
