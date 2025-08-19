import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../../configs/request";

export const useDeleteById = ({
  endpoint,
  queryKey,
}: {
  endpoint: string;
  queryKey: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number | string }) =>
      request.delete(`${endpoint}${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      console.error("Error useDeleteById:", error);
    },
  });
};
