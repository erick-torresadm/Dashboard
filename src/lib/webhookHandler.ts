import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BaserowWebhookSchema = z.object({
  Email: z.string().email(),
  Name: z.string().optional(),
  Notes: z.string(),
  Active: z.boolean().optional(),
  Pedido: z.string().optional(),
  Status: z.string().optional(),
  Expiracao: z.string().optional()
});

export type BaserowWebhookData = z.infer<typeof BaserowWebhookSchema>;

export async function handleBaserowWebhook(webhookData: unknown) {
  try {
    // Validate webhook data
    const validatedData = BaserowWebhookSchema.parse(webhookData);

    // Call the database function to process webhook
    const { data, error } = await supabase
      .rpc('handle_baserow_webhook', {
        webhook_data: validatedData
      });

    if (error) {
      console.error('Error processing webhook:', error);
      throw new Error('Failed to process webhook');
    }

    return data;
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
}

export async function validateWebhookSecret(secret: string) {
  // In a production environment, you would validate the webhook secret
  // For now, we'll just check if it matches our token
  const WEBHOOK_SECRET = 'capfLMnhVgKYbeJQIWjJQ3GyfjXJ1lXN';
  return secret === WEBHOOK_SECRET;
}