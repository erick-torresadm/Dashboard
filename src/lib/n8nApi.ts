import { z } from 'zod';

const N8N_API_URL = 'https://editor.membropro.com.br/webhook-test/proxy-list';

const N8nProxySchema = z.object({
  id: z.string(),
  email: z.string(),
  ip: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  status: z.enum(['active', 'expired']),
  expires_at: z.string(),
  name: z.string().optional(),
  order: z.string().optional(),
});

export type ProxyItem = z.infer<typeof N8nProxySchema>;

export class N8nAPI {
  private async request<T>(options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(N8N_API_URL, {
        ...options,
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('n8n API request error:', error);
      throw error;
    }
  }

  async getUserProxies(email: string): Promise<ProxyItem[]> {
    try {
      const response = await this.request<any>({
        body: JSON.stringify({ email }),
      });

      // Handle both array and object responses
      const proxyData = Array.isArray(response) ? response : response.proxies || [];
      
      // Validate and parse the response
      return z.array(N8nProxySchema).parse(proxyData);
    } catch (error) {
      console.error('Error fetching user proxies:', error);
      // Return empty array instead of throwing to handle API errors gracefully
      return [];
    }
  }
}

export const n8nApi = new N8nAPI();