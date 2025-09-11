import { useMutation, useQueryClient } from "@tanstack/react-query";
import billzRequest from "../../../configs/billz-request";

export const useBillzCreate = <TData, TVariables>({
  endpoint,
  queryKey,
}: {
  endpoint: string;
  queryKey: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, { data: TVariables }>({
    mutationFn: ({ data }) =>
      billzRequest.post<TData>(endpoint, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
    },
    onError: (error) => {
      console.error("Error useBillzCreate:", error);
    },
  });
};
