import { z } from 'zod';
import { supabase } from './supabase';

const WebhookDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  proxy_data: z.object({
    ip: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    status: z.enum(['active', 'expired']),
    expires_at: z.string()
  }),
  source: z.enum(['baserow', 'n8n']).default('baserow'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type WebhookData = z.infer<typeof WebhookDataSchema>;

export class WebhookAPI {
  async getWebhookData(userId: string): Promise<WebhookData[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching webhook data:', error);
      throw new Error('Failed to fetch webhook data');
    }

    return data;
  }

  async createWebhookEntry(userId: string, webhookData: Omit<WebhookData, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Validate webhook data
      const validatedData = WebhookDataSchema.omit({ id: true, created_at: true, updated_at: true }).parse(webhookData);

      const { data, error } = await supabase
        .from('webhooks')
        .insert([{
          user_id: userId,
          ...validatedData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating webhook entry:', error);
        throw new Error('Failed to create webhook entry');
      }

      return data;
    } catch (error) {
      console.error('Error processing webhook data:', error);
      throw error;
    }
  }

  async updateWebhookEntry(id: string, webhookData: Partial<WebhookData>) {
    const { data, error } = await supabase
      .from('webhooks')
      .update(webhookData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating webhook entry:', error);
      throw new Error('Failed to update webhook entry');
    }

    return data;
  }
}

export const webhookApi = new WebhookAPI();