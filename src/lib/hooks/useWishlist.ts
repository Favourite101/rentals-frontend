import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api/wishlist';
import { isAuthenticated } from '@/lib/hooks/useAuth';
import { QUERY_KEYS } from '@/constants';
import { showToast } from '@/lib/hooks/useToast';

export const useWishlist = () => {
  const authenticated = isAuthenticated();
  const queryClient = useQueryClient();

  const { data: wishlistIds = [] } = useQuery<number[]>({
    queryKey: [QUERY_KEYS.WISHLIST_IDS],
    queryFn: wishlistApi.getIds,
    enabled: authenticated,
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: wishlistApi.add,
    onMutate: async (equipmentId: number) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.WISHLIST_IDS] });
      const previous = queryClient.getQueryData<number[]>([QUERY_KEYS.WISHLIST_IDS]) ?? [];
      queryClient.setQueryData<number[]>([QUERY_KEYS.WISHLIST_IDS], (old = []) => [...old, equipmentId]);
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData([QUERY_KEYS.WISHLIST_IDS], ctx?.previous ?? []);
      showToast('Could not save to wishlist', 'error');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
      showToast('Saved to wishlist', 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_IDS] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: wishlistApi.remove,
    onMutate: async (equipmentId: number) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.WISHLIST_IDS] });
      const previous = queryClient.getQueryData<number[]>([QUERY_KEYS.WISHLIST_IDS]) ?? [];
      queryClient.setQueryData<number[]>([QUERY_KEYS.WISHLIST_IDS], (old = []) => old.filter((id) => id !== equipmentId));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData([QUERY_KEYS.WISHLIST_IDS], ctx?.previous ?? []);
      showToast('Could not remove from wishlist', 'error');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
      showToast('Removed from wishlist', 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_IDS] });
    },
  });

  const isWishlisted = (equipmentId: number) => wishlistIds.includes(equipmentId);

  const toggle = (equipmentId: number) => {
    if (!authenticated) {
      showToast('Sign in to save items to your wishlist', 'error');
      return;
    }
    if (isWishlisted(equipmentId)) {
      removeMutation.mutate(equipmentId);
    } else {
      addMutation.mutate(equipmentId);
    }
  };

  return { isWishlisted, toggle, authenticated };
};
