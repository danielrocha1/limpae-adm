import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
}

export function useUser(id) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const cachedUsers = queryClient.getQueryData(['users']);
      const cachedUser = Array.isArray(cachedUsers)
        ? cachedUsers.find((user) => String(user.ID ?? user.id) === String(id))
        : null;

      if (cachedUser) {
        return cachedUser;
      }

      const users = await userService.getAll();
      return users.find((item) => String(item.ID ?? item.id) === String(id)) || null;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
