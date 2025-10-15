/*
  # Add increment votes function

  ## Overview
  Creates a PostgreSQL function to atomically increment candidate vote counts.

  ## New Functions
  - `increment_votes` - Safely increments the votes count for a candidate by 1
    - Parameters:
      - `candidate_id` (uuid) - The ID of the candidate to increment votes for
    - Returns: void
    - Security: Ensures atomic increment operation to prevent race conditions

  ## Notes
  - This function provides a thread-safe way to increment vote counts
  - Uses UPDATE with incrementing existing value rather than reading then writing
*/

CREATE OR REPLACE FUNCTION increment_votes(candidate_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE candidates
  SET votes = votes + 1
  WHERE id = candidate_id;
END;
$$;