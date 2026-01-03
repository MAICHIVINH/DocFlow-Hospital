# BỐ VỀ LỖI: STAFF KHÔNG XEM ĐƯỢC DỮ LIỆU PHÒNG BAN (Bug Fix Report)

## Vấn Đề (Problem)
Staff users couldn't see any data in their department on:
- Documents page
- Dashboard page  
- Statistics page

## Nguyên Nhân (Root Causes)

### 1. **listDocuments Controller - Visibility Filter Overwritten**
**File:** `src/controllers/document.controller.js` (lines 104-147)

**Problem:** The code was using direct property assignment which **overwrote** the visibility access control:
```javascript
// WRONG - This overwrites the Op.and visibility clause
if (department_id) whereClause.departmentId = department_id;
if (status) whereClause.status = status;
```

When a staff user viewed the documents page, any filter would directly overwrite the `Op.and` array containing visibility rules, allowing the query to bypass access control.

### 2. **Stats Controller - Object.assign() Overwrites Accessibility**
**File:** `src/controllers/stats.controller.js` (multiple functions)

**Problem:** Using `Object.assign(where, accessClause)` when `accessClause` contains `Op.or` conditions:
```javascript
// WRONG - Object.assign overwrites the entire where object
const accessClause = getAccessibilityClause(req);
Object.assign(where, accessClause);
```

This completely replaced any date filters with the accessibility clause, losing the visibility filter.

### 3. **Duplicate visibility condition in getAccessibilityClause**
**File:** `src/controllers/stats.controller.js` (line 21-23)

The DEPARTMENT visibility condition was repeated twice in the OR clause.

## 改正 (Solutions Applied)

### ✅ Fix 1: listDocuments - Proper AND logic
Changed from overwriting individual properties to building an array of AND conditions:
```javascript
const andConditions = [];

// Add visibility check first (always)
if (req.userRole !== 'ADMIN') {
    andConditions.push({
        [Op.or]: [
            { visibility: 'PUBLIC' },
            { visibility: 'DEPARTMENT', departmentId: req.userDeptId },
            { visibility: 'PRIVATE', creatorId: req.userId }
        ]
    });
}

// Add other filters to AND array (never overwrite)
if (status) andConditions.push({ status });
if (department_id) andConditions.push({ departmentId: department_id });

// Combine all conditions with Op.and
if (andConditions.length > 0) {
    whereClause[Op.and] = andConditions;
}
```

### ✅ Fix 2: Stats Controller - Proper WHERE construction
Changed all functions to properly combine conditions:
```javascript
const whereConditions = [];

// Add date filter if provided
if (startDate && endDate) {
    whereConditions.push({
        createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
    });
}

// Add accessibility filter
const accessClause = getAccessibilityClause(req);
if (Object.keys(accessClause).length > 0) {
    whereConditions.push(accessClause);
}

// Properly combine with Op.and
const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};
```

**Functions Updated:**
- `getDocumentStatsByDept()`
- `getUsageStats()`
- `getMonthlyStats()`
- `getTagStats()`
- `getUserContributionStats()`
- `exportDocumentsToExcel()`

### ✅ Fix 3: Removed duplicate visibility condition
Fixed the OR clause to have each condition only once.

## 結果 (Expected Results)

After applying these fixes:

1. **Documents Page** - Staff can now see:
   - All PUBLIC documents
   - DEPARTMENT documents from their own department
   - Their own PRIVATE documents

2. **Dashboard** - Stats now correctly show:
   - Total documents they have access to
   - Pending approvals they have access to
   - Recent documents matching their visibility level

3. **Statistics Page** - All charts and stats properly filtered:
   - Documents by department (only accessible ones)
   - Monthly upload trends (correct data)
   - Tag statistics (correct data)
   - User contribution stats (correct data)

## 測試建議 (Testing Recommendations)

Test with a staff account:
1. ✅ Login as STAFF user
2. ✅ Go to Documents page - should see department documents
3. ✅ Go to Dashboard - should see stats for accessible documents
4. ✅ Go to Statistics page - should see filtered data only
5. ✅ Try uploading document with DEPARTMENT visibility - should be visible
6. ✅ Try various filters - should still see only accessible documents

## 档案修改 (Files Modified)

1. `src/controllers/document.controller.js` - Fixed listDocuments function
2. `src/controllers/stats.controller.js` - Fixed all stats functions

---
**修復日期 (Fix Date):** January 3, 2026  
**狀態 (Status):** ✅ Complete
