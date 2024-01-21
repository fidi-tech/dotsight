export type NFTRaw = {
  id: string;
  contract_id: string;
  inner_id: string;
  chain: string;
  name: string;
  description: string;
  content_type: string;
  content: string;
  thumbnail_url: string;
  total_supply: number;
  detail_url: string;
  attributes: Array<object>;
  collection_id: string;
  pay_token?: {
    id: string;
    chain: string;
    name: string;
    symbol: string;
    display_symbol: string | null;
    optimized_symbol: string;
    decimals: number;
    logo_url: string;
    protocol_id: string;
    price: number;
    price_24h_change: number | null;
    credit_score: number;
    is_verified: boolean;
    is_scam: boolean;
    is_suspicious: boolean;
    is_core: boolean;
    is_wallet: boolean;
    time_at: number;
    amount: number;
    date_at: string;
  };
  contract_name: string;
  is_erc721: boolean;
  amount: number;
  usd_price: number;
};
