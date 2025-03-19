/*
  # Add Webhooks Table for Baserow Integration

  1. New Tables
    - webhooks
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - email (text)
      - name (text)
      - proxy_data (jsonb)
      - source (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on webhooks table
    - Add policy for authenticated users to access their own webhook data
*/

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  proxy_data jsonb NOT NULL,
  source text NOT NULL DEFAULT 'baserow',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT webhooks_source_check CHECK (source IN ('baserow', 'n8n'))
);

-- Enable Row Level Security
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own webhook data"
  ON webhooks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX webhooks_email_idx ON webhooks (email);

-- Add comment to explain proxy_data structure
COMMENT ON COLUMN webhooks.proxy_data IS 'JSON structure containing proxy details from webhook: { "ip": string, "port": number, "username": string, "password": string, "status": "active" | "expired", "expires_at": timestamp }';