import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../../configs/request";

export const useUpdate = <TData, TVariables>({
  endpoint,
  queryKey,
}: {
  endpoint: string;
  queryKey: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, { id?: string | number | bigint; data: TVariables }>({
    mutationFn: ({ id, data }) =>
      request
        .put<TData>(id ? endpoint + id : endpoint, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
    },
    onError: (error) => {
      console.error("Error useUpdate:", error);
    },
  });
};
