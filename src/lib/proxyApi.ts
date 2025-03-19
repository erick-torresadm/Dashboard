import { supabase } from './supabase';
import type { Proxy, Order, ProxyFast } from './supabaseTypes';

export class ProxyAPI {
  async getUserProxies(userId: string): Promise<Proxy[]> {
    const { data, error } = await supabase
      .from('proxies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proxies:', error);
      throw new Error('Failed to fetch proxies');
    }

    return data;
  }

  async getUserProxyFast(userId: string): Promise<ProxyFast[]> {
    const { data, error } = await supabase
      .from('proxy_fast')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proxy_fast:', error);
      throw new Error('Failed to fetch proxy_fast data');
    }

    return data;
  }

  async createProxyFast(proxyData: Omit<ProxyFast, 'id' | 'created_at' | 'updated_at'>): Promise<ProxyFast> {
    const { data, error } = await supabase
      .from('proxy_fast')
      .insert([proxyData])
      .select()
      .single();

    if (error) {
      console.error('Error creating proxy_fast:', error);
      throw new Error('Failed to create proxy_fast');
    }

    return data;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }

    return data;
  }

  async createOrder(userId: string, amount: number): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          amount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }

    return data;
  }
}

export const proxyApi = new ProxyAPI();