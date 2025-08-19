import { useQuery } from "@tanstack/react-query";
import request from "../../configs/request";

interface UseGetListProps {
  endpoint: string;
  params?: Record<string, any>;
  enabled?: boolean;
}

export const useGetList = <T>({
  endpoint,
  params = {},
  enabled = true,
}: UseGetListProps) => {
  return useQuery<T, Error>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const response = await request.get(endpoint, { params });
      return response.data;
    },
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};
