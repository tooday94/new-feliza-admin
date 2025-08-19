import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../../configs/request";

export const useCreate = <TData, TVariables>({
  endpoint,
  queryKey,
}: {
  endpoint: string;
  queryKey: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: (data: TVariables) =>
      request.post<TData>(endpoint, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
    },
    onError: (error) => {
      console.error("Error useCreate:", error);
    },
  });
};
