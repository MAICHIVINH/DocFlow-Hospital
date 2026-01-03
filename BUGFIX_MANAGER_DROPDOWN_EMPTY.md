# FIX: Manager Users Can't See Filter Dropdowns

## Problem
When logged in as MANAGER account, the department and user filter dropdowns on the Documents page are empty, but they work fine for ADMIN accounts.

## Root Cause
The `/users` GET endpoint had an `isAdmin` middleware restriction that prevented MANAGER and STAFF users from accessing the users list:

```javascript
// BEFORE (WRONG)
router.get('/', [verifyToken, isAdmin], userController.listUsers);
```

This meant:
- **ADMIN** → Can access `/users` API → Dropdown has data ✅
- **MANAGER/STAFF** → Gets 403 Forbidden → Dropdown is empty ❌

## Solution Applied

### 1. Updated Route Authorization
**File:** `src/routes/user.routes.js`

Changed from `isAdmin` to `authorizeRole(['ADMIN', 'MANAGER', 'STAFF'])`:
```javascript
// AFTER (CORRECT)
router.get('/', [verifyToken, authorizeRole(['ADMIN', 'MANAGER', 'STAFF'])], userController.listUsers);
```

This allows all authenticated users to access the endpoint.

### 2. Added Department Filtering in Controller
**File:** `src/controllers/user.controller.js`

Added role-based data filtering so:
- **ADMIN** sees all users in the system
- **MANAGER/STAFF** see only users in their own department

```javascript
// Role-based filtering: Non-admin users can only see users in their department
if (req.userRole !== 'ADMIN') {
    where.departmentId = req.userDeptId;
}
```

## Result
Now when MANAGER users access the Documents page:
- ✅ Department dropdown shows all departments (for general filtering)
- ✅ User/Creator dropdown shows users from their department only
- ✅ ADMIN still sees all users (no change)

## Files Modified
1. `src/routes/user.routes.js` - Changed authorization middleware
2. `src/controllers/user.controller.js` - Added department filtering logic

---
**Status:** ✅ Fixed  
**Date:** January 3, 2026
