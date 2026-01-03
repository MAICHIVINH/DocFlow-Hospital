-- Fix visibility ENUM values
-- Step 1: Drop existing default value first
ALTER TABLE "documents" ALTER COLUMN "visibility" DROP DEFAULT;

-- Step 2: Rename old enum
ALTER TYPE "enum_documents_visibility" RENAME TO "enum_documents_visibility_old";

-- Step 3: Create new enum with correct values
CREATE TYPE "enum_documents_visibility" AS ENUM('PUBLIC', 'DEPARTMENT', 'PRIVATE');

-- Step 4: Update the column with value mapping
ALTER TABLE "documents" 
ALTER COLUMN "visibility" TYPE "enum_documents_visibility" 
USING (
    CASE 
        WHEN "visibility"::text = 'INTERNAL' THEN 'DEPARTMENT'::"enum_documents_visibility"
        WHEN "visibility"::text = 'PRIVATE' THEN 'PRIVATE'::"enum_documents_visibility"
        WHEN "visibility"::text = 'PUBLIC' THEN 'PUBLIC'::"enum_documents_visibility"
        ELSE 'DEPARTMENT'::"enum_documents_visibility"
    END
);

-- Step 5: Set new default value
ALTER TABLE "documents" ALTER COLUMN "visibility" SET DEFAULT 'DEPARTMENT';

-- Step 6: Drop old enum
DROP TYPE "enum_documents_visibility_old";
