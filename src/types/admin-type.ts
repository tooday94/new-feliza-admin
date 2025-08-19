export interface AdminType {
  id: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  roles: {
    id: number;
    roleName?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  authorities: any[];
  enabled: boolean;
  text: string;
  paid: boolean;
  orderStatusType: string;
  statusCounts: Record<string, number>;
  orderCost: number;
  percent: number;
}
