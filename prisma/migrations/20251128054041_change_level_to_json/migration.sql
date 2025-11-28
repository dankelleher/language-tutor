/*
  Warnings:

  - The `level` column on the `ChatSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "level",
ADD COLUMN     "level" JSONB;
