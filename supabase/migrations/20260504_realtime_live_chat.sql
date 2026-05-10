-- Enable Supabase Realtime for live-chat tables so the admin
-- live-chat page can replace 3-second polling with push updates.

alter publication supabase_realtime add table chat_escalations;
alter publication supabase_realtime add table ai_chat_messages;
