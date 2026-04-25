import { useQuery } from '@tanstack/react-query';
import { serviceService } from '../services/api';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: serviceService.getAll,
  });
}
