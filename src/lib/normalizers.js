function toSnakeCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

export function normalizeKeys(input) {
  if (Array.isArray(input)) {
    return input.map(normalizeKeys);
  }

  if (input && typeof input === "object" && input.constructor === Object) {
    return Object.entries(input).reduce((accumulator, [key, value]) => {
      accumulator[toSnakeCase(key)] = normalizeKeys(value);
      return accumulator;
    }, {});
  }

  return input;
}

function firstAddress(item) {
  if (Array.isArray(item?.address) && item.address.length) return item.address[0];
  if (item?.address && typeof item.address === "object") return item.address;
  return null;
}

export function normalizeUsers(payload) {
  const items = normalizeKeys(payload);
  const list = Array.isArray(items) ? items : items?.items || [];

  return list.map((item) => {
    const address = firstAddress(item);
    const diaristProfile = item.diarist_profile || {};
    const userProfile = item.user_profile || {};

    return {
      ...item,
      address,
      city: address?.city || "-",
      state: address?.state || "-",
      neighborhood: address?.neighborhood || "-",
      available: diaristProfile.available,
      price_per_hour: diaristProfile.price_per_hour,
      price_per_day: diaristProfile.price_per_day,
      experience_years: diaristProfile.experience_years,
      residence_type: userProfile.residence_type,
      desired_frequency: userProfile.desired_frequency,
      has_pets_profile: userProfile.has_pets,
    };
  });
}

export function normalizeServices(payload) {
  const items = normalizeKeys(payload);
  const list = Array.isArray(items) ? items : items?.items || [];

  return list.map((item) => ({
    ...item,
    client_name: item.client?.name || "-",
    diarist_name: item.diarist?.name || "-",
    city: item.address?.city || "-",
    neighborhood: item.address?.neighborhood || "-",
  }));
}

export function normalizePayments(payload) {
  const items = normalizeKeys(payload);
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map((item) => ({ ...item }));
}

export function normalizeReviews(payload) {
  const items = normalizeKeys(payload);
  const list = Array.isArray(items) ? items : items?.items || [];

  return list.map((item) => ({
    ...item,
    average_rating:
      item.client_rating && item.diarist_rating
        ? (Number(item.client_rating) + Number(item.diarist_rating)) / 2
        : Number(item.client_rating || item.diarist_rating || 0),
  }));
}

export function normalizeSubscriptions(payload) {
  const items = normalizeKeys(payload);
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map((item) => ({ ...item }));
}

export function normalizeOffers(payload) {
  const items = normalizeKeys(payload);
  const list = Array.isArray(items) ? items : items?.items || [];

  return list.map((item) => ({
    ...item,
    client_name: item.client?.name || item.client_name || "-",
    accepted_by_name: item.accepted_by_diarist?.name || "-",
    neighborhood: item.address?.neighborhood || item.address_neighborhood || "-",
    city: item.address?.city || item.address_city || "-",
    negotiations_count: Array.isArray(item.negotiations) ? item.negotiations.length : 0,
  }));
}
