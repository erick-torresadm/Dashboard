export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Proxy = {
  id: string;
  user_id: string;
  ip_address: string;
  port: number;
  username: string;
  password: string;
  status: 'active' | 'expired';
  expires_at: string;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  proxy_ids: string[];
  created_at: string;
};

export type ProxyFast = {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  proxy_data: {
    ip: string;
    port: number;
    username: string;
    password: string;
    status: 'active' | 'expired';
    expires_at: string;
  };
  created_at: string;
  updated_at: string;
};

export type Webhook = {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  proxy_data: {
    ip: string;
    port: number;
    username: string;
    password: string;
    status: 'active' | 'expired';
    expires_at: string;
  };
  source: 'baserow' | 'n8n';
  created_at: string;
  updated_at: string;
};