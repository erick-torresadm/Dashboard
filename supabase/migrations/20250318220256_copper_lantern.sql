/*
  # Create Proxy Fast Table

  1. New Table
    - proxy_fast
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - email (text)
      - name (text)
      - proxy_data (jsonb) - Stores proxy connection details
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on proxy_fast table
    - Add policy for authenticated users to read their own data
*/

-- Create proxy_fast table
CREATE TABLE IF NOT EXISTS proxy_fast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  proxy_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE proxy_fast ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own proxy_fast data"
  ON proxy_fast FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_proxy_fast_updated_at
  BEFORE UPDATE ON proxy_fast
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX proxy_fast_email_idx ON proxy_fast (email);

-- Add comment to explain proxy_data structure
COMMENT ON COLUMN proxy_fast.proxy_data IS 'JSON structure containing proxy details: { "ip": string, "port": number, "username": string, "password": string, "status": "active" | "expired", "expires_at": timestamp }';