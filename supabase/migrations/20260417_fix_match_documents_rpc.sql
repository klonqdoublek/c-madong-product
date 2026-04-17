-- Fix #1: Add document_title to match_documents RPC
-- Root cause: RAG answer generator expects document_title but RPC never returned it
-- Also adds filter for document status = 'ready' to exclude unprocessed docs

SET search_path TO public, extensions;

-- Must DROP first because return type changed (added document_title column)
DROP FUNCTION IF EXISTS public.match_documents(vector, int, float);

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  document_title text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.document_id,
    ds.content,
    1 - (ds.embedding <=> query_embedding) AS similarity,
    d.title AS document_title
  FROM public.document_sections ds
  JOIN public.documents d ON d.id = ds.document_id
  WHERE 1 - (ds.embedding <=> query_embedding) > match_threshold
    AND d.status = 'ready'
  ORDER BY ds.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fix #2: Dedicated per-document search function
-- Avoids global top-N crowding out this document's sections
CREATE OR REPLACE FUNCTION public.match_document_sections(
  query_embedding vector(1536),
  target_document_id uuid,
  match_count int default 5,
  match_threshold float default 0.2
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.document_id,
    ds.content,
    1 - (ds.embedding <=> query_embedding) AS similarity
  FROM public.document_sections ds
  WHERE ds.document_id = target_document_id
    AND 1 - (ds.embedding <=> query_embedding) > match_threshold
  ORDER BY ds.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
