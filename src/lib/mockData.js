export const mockCollections = {
  users: [
    { id: 1, name: "Ana Martins", email: "ana@limpae.com", phone: "11998877665", role: "cliente", created_at: "2026-03-10T14:00:00Z" },
    { id: 2, name: "Clara Souza", email: "clara@limpae.com", phone: "21995544332", role: "diarista", created_at: "2026-03-12T09:15:00Z" },
  ],
  services: [
    { id: 18, status: "pendente", total_price: 190, duration_hours: 4, scheduled_at: "2026-03-19T13:00:00Z", service_type: "Limpeza pesada", client: { name: "Ana Martins" }, diarist: { name: "Clara Souza" } },
    { id: 19, status: "concluído", total_price: 150, duration_hours: 3, scheduled_at: "2026-03-17T09:00:00Z", service_type: "Limpeza padrão", client: { name: "Bruno Lima" }, diarist: { name: "Ester Alves" } },
  ],
  payments: [
    { id: 1, amount: 190, status: "pendente", method: "pix", service_id: 18 },
    { id: 2, amount: 150, status: "paid", method: "cartao", service_id: 19 },
  ],
  offers: [
    { id: 8, service_type: "Pos-obra", status: "aberta", current_value: 320, initial_value: 280, scheduled_at: "2026-03-20T10:00:00Z" },
  ],
  reviews: [
    { id: 1, service_id: 19, client_id: 1, diarist_id: 2, client_rating: 5, diarist_rating: 4, client_comment: "Excelente atendimento" },
  ],
  subscriptions: [
    { id: 1, user_id: 2, plan: "premium", price: 59.99, status: "active", expires_at: "2026-04-15T00:00:00Z" },
  ],
};
