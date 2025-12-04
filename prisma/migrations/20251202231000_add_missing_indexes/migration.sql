-- Add unique indexes that were missing from the live schema.
CREATE UNIQUE INDEX IF NOT EXISTS "Issue_year_month_key" ON "Issue"("year", "month");
CREATE UNIQUE INDEX IF NOT EXISTS "SavedArticle_userId_articleId_key" ON "SavedArticle"("userId", "articleId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReadingProgress_userId_articleId_key" ON "ReadingProgress"("userId", "articleId");
