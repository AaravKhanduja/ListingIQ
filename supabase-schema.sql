-- Create property_analyses table
CREATE TABLE property_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_address TEXT NOT NULL,
    property_title TEXT NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    summary TEXT NOT NULL,
    strengths TEXT[] NOT NULL DEFAULT '{}',
    weaknesses TEXT[] NOT NULL DEFAULT '{}',
    hidden_issues TEXT[] NOT NULL DEFAULT '{}',
    questions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_property_analyses_address ON property_analyses(property_address);
CREATE INDEX idx_property_analyses_created_at ON property_analyses(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON property_analyses
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_property_analyses_updated_at
    BEFORE UPDATE ON property_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 