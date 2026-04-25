import { useQuery } from '@tanstack/react-query';
import { serviceService } from '../services/api';

export function useServices(params) {
  return useQuery({
    queryKey: params ? ['services', params] : ['services'],
    queryFn: () => (params ? serviceService.getPage(params) : serviceService.getAll()),
    keepPreviousData: true,
  });
}
