import { useQuery } from "@tanstack/react-query";
import { offerService } from "../services/api";

export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: offerService.getAll,
  });
}
