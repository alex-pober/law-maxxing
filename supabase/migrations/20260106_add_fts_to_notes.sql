-- Add Full Text Search to notes table
-- content_markdown is weighted higher (A) since note titles are often generic like "Class 2", "Session 3"

-- Add the FTS column with weighted search (content is A priority, title is B)
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS fts tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(content_markdown, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(title, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS notes_fts_idx ON notes USING GIN (fts);

-- Optional: Add index on user_id + fts for faster user-scoped searches
CREATE INDEX IF NOT EXISTS notes_user_fts_idx ON notes (user_id) INCLUDE (fts);
