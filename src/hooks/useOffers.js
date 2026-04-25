import { useQuery } from "@tanstack/react-query";
import { offerService } from "../services/api";

export function useOffers(params) {
  return useQuery({
    queryKey: params ? ["offers", params] : ["offers"],
    queryFn: () => (params ? offerService.getPage(params) : offerService.getAll()),
    keepPreviousData: true,
  });
}
