-- Social profiles. Kept as its own settings row (not nested under `site`) so the
-- dashboard shows it as its own tab with a repeatable row editor, and so the
-- list stays editable without touching contact details.
--
-- `label` drives both the visible link text and the icon lookup in
-- components/chrome/SocialLinks.tsx — an unrecognised label still renders, with
-- a generic glyph. Order here is the order rendered in the footer.
INSERT INTO settings (key, data) VALUES (
  'social',
  '{"links":[{"label":"Facebook","url":"https://www.facebook.com/Zee99developersofficial/"},{"label":"Instagram","url":"https://www.instagram.com/zee99developersofficial"},{"label":"YouTube","url":"https://www.youtube.com/@zee99developersofficial"},{"label":"TikTok","url":"https://www.tiktok.com/@zee99developersofficial"}]}'
)
ON CONFLICT(key) DO UPDATE SET data=excluded.data, updated_at=datetime('now');
