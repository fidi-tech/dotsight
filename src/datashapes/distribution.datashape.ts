export type DistributionDatashape = {
  items: Array<{
    id: string;
    name: string;
    iconUrl?: string;
    value: number;
  }>;
  restItemsValue: number;
};
