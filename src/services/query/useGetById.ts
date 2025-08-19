import { useQuery } from "@tanstack/react-query";
import request from "../../configs/request";

export const useGetById = <T>({
  endpoint,
  id,
  enabled = true,
  refetchOnMount = false,
  refetchOnWindowFocus = false,
}: {
  endpoint: string;
  id: string | number;
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}) => {
  return useQuery<T>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const response = await request.get(`${endpoint + id}`);
      return response.data;
    },
    enabled: Boolean(id) && enabled,
    refetchOnMount,
    refetchOnWindowFocus,
    placeholderData: (prev) => prev,
  });
};
