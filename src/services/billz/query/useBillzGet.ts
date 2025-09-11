import { useQuery } from "@tanstack/react-query";
import billzRequest from "../../../configs/billz-request";

interface UseGetListProps {
  endpoint: string;
  params?: Record<string, any>;
  enabled?: boolean;
}

export const useBillzGet = <T>({
  endpoint,
  params = {},
  enabled = true,
}: UseGetListProps) => {
  return useQuery<T, Error>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const response = await billzRequest.get(endpoint, { params });
      return response.data;
    },
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};
