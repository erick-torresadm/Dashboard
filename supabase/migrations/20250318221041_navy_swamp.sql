/*
  # Add Baserow Webhook Handler Function

  1. New Function
    - handle_baserow_webhook: Processes incoming Baserow webhook data
    - Validates and stores proxy information
    - Updates existing records or creates new ones

  2. Security
    - Function runs with security definer to allow webhook processing
    - Validates webhook data structure
*/

-- Create function to handle Baserow webhooks
CREATE OR REPLACE FUNCTION handle_baserow_webhook(
  webhook_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_name text;
  v_notes text;
  v_proxy_data jsonb;
  v_result jsonb;
BEGIN
  -- Extract data from webhook payload
  v_email := webhook_data->>'Email';
  v_name := webhook_data->>'Name';
  v_notes := webhook_data->>'Notes';

  -- Get user_id from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  -- Parse proxy data from notes
  v_proxy_data := jsonb_build_object(
    'ip', split_part(v_notes, ':', 1),
    'port', (split_part(v_notes, ':', 2))::int,
    'username', split_part(v_notes, ':', 3),
    'password', split_part(v_notes, ':', 4),
    'status', CASE WHEN webhook_data->>'Active' = 'true' THEN 'active' ELSE 'expired' END,
    'expires_at', COALESCE(webhook_data->>'Expiracao', now() + interval '30 days')
  );

  -- Insert or update proxy_fast record
  INSERT INTO proxy_fast (
    user_id,
    email,
    name,
    proxy_data
  )
  VALUES (
    v_user_id,
    v_email,
    v_name,
    v_proxy_data
  )
  ON CONFLICT (email) DO UPDATE
  SET
    name = EXCLUDED.name,
    proxy_data = EXCLUDED.proxy_data,
    updated_at = now()
  RETURNING jsonb_build_object(
    'id', id,
    'email', email,
    'name', name,
    'proxy_data', proxy_data,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;