# FIX: Tag Filtering Not Working

## Problem
When users select a tag filter on the Documents page, no results are returned or filtering doesn't work correctly.

## Root Cause
The issue was in the `listDocuments` function in `src/controllers/document.controller.js`:

1. **Missing `subQuery: false`**: When combining complex `Op.and` conditions (with nested `Op.or` for visibility rules) with a required association (tag filter), Sequelize would generate incorrect SQL subqueries.

2. **Improper where clause construction**: The date range filter was being assigned directly to `whereClause`, potentially overwriting or conflicting with the AND conditions.

## Solution Applied

### 1. Added `subQuery: false` to Query Options
```javascript
const queryOptions = {
    where: whereClause,
    include: includeModels,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    distinct: true,
    subQuery: false // ← THIS IS KEY FOR TAG FILTERING
};
```

### 2. Proper AND Conditions Handling
All filters (status, department, creator, date range, search) are now properly added to the `andConditions` array:
```javascript
if (whereClause[Op.and]) {
    whereClause[Op.and].push(newCondition);
} else {
    Object.assign(whereClause, newCondition);
}
```

### 3. Conditional Tag Include
- When `tag_id` is provided: Include tag with `required: true` (INNER JOIN)
- When no tag filter: Include tags with `required: false` (LEFT JOIN)

```javascript
if (tag_id) {
    includeModels.push({
        model: Tag,
        as: 'tags',
        where: { id: tag_id },
        through: { attributes: [] },
        required: true // Inner join to enforce filter
    });
} else {
    includeModels.push({
        model: Tag,
        as: 'tags',
        through: { attributes: [] },
        required: false // Left join to just show tags
    });
}
```

### 4. Debug Logging Added
```javascript
if (tag_id) {
    console.log('[DEBUG] Tag Filter Applied:', {
        tagId: tag_id,
        whereClause,
        includeModelsCount: includeModels.length
    });
}
```

## Testing
To verify tag filtering works:
1. Upload a document and assign it one or more tags
2. Navigate to Documents page
3. Select a tag from the tag filter dropdown
4. Documents with that tag should appear
5. Check browser console for debug messages

## Files Modified
- `src/controllers/document.controller.js` - listDocuments function (lines 104-260)

---
**Status:** ✅ Fixed  
**Date:** January 3, 2026
