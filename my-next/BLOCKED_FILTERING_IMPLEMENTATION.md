# Blocked Kitchen & User Filtering Implementation

## ✅ What Was Implemented

### 1. **Role-Based Kitchen Filtering**
When blocked kitchens are hidden from non-admin users but remain visible to admins for management.

#### API Endpoint: `GET /api/admin/kitchens`
**Location**: `/app/api/admin/kitchens/route.ts`

**Behavior**:
- **Admin Role**: Sees ALL kitchens (ACTIVE + BLOCKED)
- **Kitchen/Pantry Roles**: Only sees ACTIVE kitchens
- **Blocked kitchens** are completely hidden from non-admin users

```typescript
// Admin sees all kitchens, other roles only see active ones
const isAdmin = req.user?.role === 'ADMIN'

const kitchens = await prisma.kitchen.findMany({
  where: isAdmin ? undefined : { status: 'ACTIVE' },
  // ... rest of query
})
```

---

### 2. **Blocked Kitchen Batch Filtering**
Batches from blocked kitchens are hidden from non-admin users.

#### API Endpoint: `GET /api/admin/batches`
**Location**: `/app/api/admin/batches/route.ts`

**Behavior**:
- **Admin Role**: Sees ALL batches (including from blocked kitchens)
- **Kitchen/Pantry Roles**: Only sees batches from ACTIVE kitchens
- Batches from blocked kitchens are filtered out for non-admins

```typescript
// Admin sees all batches, other roles only see batches from active kitchens
const isAdmin = req.user?.role === 'ADMIN'

const batches = await prisma.batch.findMany({
  where: isAdmin ? undefined : {
    kitchen: {
      status: 'ACTIVE'
    }
  },
  include: {
    kitchen: {
      select: {
        name: true,
        status: true, // Include status for admin view
      },
    },
    // ... rest of query
  }
})
```

---

### 3. **Blocked User Login Prevention**
Users who are blocked (inactive) cannot log in to the system.

#### API Endpoint: `POST /api/auth/login`
**Location**: `/app/api/auth/login/route.ts`

**Already Implemented** ✅:
```typescript
// Check if user is active
if (!user.active) {
  return NextResponse.json(
    { error: 'Account is inactive' },
    { status: 403 }
  )
}
```

---

### 4. **Admin Dashboard Visual Indicators**
Admin dashboard shows blocked status clearly with visual indicators.

#### Location: `/app/admin/dashboard/page.tsx`

**Features Added**:
- Batches from blocked kitchens show with red background tint
- "BLOCKED" badge next to kitchen name in batch list
- Updated TypeScript interface to include kitchen status

```tsx
{batches.map((batch) => {
  const isBlockedKitchen = batch.kitchen.status === 'BLOCKED'
  return (
    <tr className={isBlockedKitchen ? 'bg-red-50/30' : ''}>
      <td>
        <div className="flex items-center gap-2">
          <span>{batch.kitchen.name}</span>
          {isBlockedKitchen && (
            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
              BLOCKED
            </span>
          )}
        </div>
      </td>
      {/* ... rest of columns */}
    </tr>
  )
})}
```

---

## 🎯 Complete User Flow Examples

### 📋 Admin User Flow
1. **Login** → ✅ Can login (if active)
2. **View Kitchens** → ✅ Sees ALL kitchens (ACTIVE + BLOCKED)
3. **View Batches** → ✅ Sees ALL batches (including from blocked kitchens)
4. **Blocked batches** → Show with red highlight and "BLOCKED" badge
5. **Can manage** → Block/Activate kitchens and users

### 👨‍🍳 Kitchen User Flow
1. **Login** → ✅ Can login (if active) / ❌ Rejected if blocked
2. **View Kitchens** → ✅ Only sees ACTIVE kitchens
3. **View Batches** → ✅ Only sees batches from ACTIVE kitchens
4. **Blocked kitchens** → Completely hidden from view
5. **Cannot manage** → No access to block/unblock features

### 🥘 Pantry User Flow
1. **Login** → ✅ Can login (if active) / ❌ Rejected if blocked
2. **View Kitchens** → ✅ Only sees ACTIVE kitchens
3. **View Batches** → ✅ Only sees batches from ACTIVE kitchens
4. **Blocked kitchens** → Completely hidden from view
5. **Cannot manage** → No access to block/unblock features

---

## 🔒 Security & Access Control

### ✅ What Happens When Blocked:

#### **Blocked User**:
- ❌ Cannot login (403 error: "Account is inactive")
- ❌ Existing sessions remain valid until token expires
- ⚠️ Consider implementing token blacklist for immediate logout

#### **Blocked Kitchen**:
- ✅ Admin can still see and manage
- ❌ Hidden from Kitchen/Pantry role users
- ❌ All batches from blocked kitchen hidden from non-admins
- ✅ Kitchen staff can still login (unless user is also blocked)
- ⚠️ Consider preventing blocked kitchens from creating new batches

---

## 📊 Visual Comparison

### Before vs After

#### **BEFORE** (No filtering):
```
Kitchen User sees:
- Kitchen A (ACTIVE) ✓
- Kitchen B (BLOCKED) ✓  ← Should NOT see this!
- Kitchen C (ACTIVE) ✓

Total: 3 kitchens
```

#### **AFTER** (With filtering):
```
Admin sees:
- Kitchen A (ACTIVE) ✓
- Kitchen B (BLOCKED [Badge shown]) ✓
- Kitchen C (ACTIVE) ✓
Total: 3 kitchens

Kitchen User sees:
- Kitchen A (ACTIVE) ✓
- Kitchen C (ACTIVE) ✓
Total: 2 kitchens (Kitchen B hidden)
```

---

## 🧪 Testing the Implementation

### Manual Testing Steps:

1. **Create a test kitchen** (as admin):
   ```
   Dashboard → Kitchen Management → Create Kitchen
   Name: "Test Kitchen"
   ```

2. **Block the kitchen** (as admin):
   ```
   Dashboard → Kitchen Management → Click "Block" on Test Kitchen
   ```

3. **Login as Kitchen user**:
   ```
   Email: kitchen@railway.com
   Password: kitchen123
   ```

4. **Verify blocked kitchen is hidden**:
   ```
   Kitchen Dashboard → Should NOT see "Test Kitchen" in list
   ```

5. **Login back as Admin**:
   ```
   Should SEE "Test Kitchen" with BLOCKED status
   ```

### API Testing:

```bash
# Get Admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@railway.com","password":"admin123"}' \
  | jq -r '.token')

# Get Kitchen user token
KITCHEN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kitchen@railway.com","password":"kitchen123"}' \
  | jq -r '.token')

# Compare results
echo "Admin sees:"
curl -s http://localhost:3000/api/admin/kitchens \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | .name + " - " + .status'

echo "\nKitchen user sees:"
curl -s http://localhost:3000/api/admin/kitchens \
  -H "Authorization: Bearer $KITCHEN_TOKEN" | jq -r '.[] | .name + " - " + .status'
```

---

## 📝 Files Modified

1. **`/app/api/admin/kitchens/route.ts`**
   - Added role-based filtering for kitchen listing
   - Admin sees all, others see only ACTIVE

2. **`/app/api/admin/batches/route.ts`**
   - Added role-based filtering for batch listing
   - Filters out batches from BLOCKED kitchens for non-admins
   - Includes kitchen status in response for admin display

3. **`/app/admin/dashboard/page.tsx`**
   - Updated Batch interface to include kitchen status
   - Added visual indicators for blocked kitchens
   - Red background tint for batches from blocked kitchens
   - "BLOCKED" badge next to kitchen name

4. **`/app/api/auth/login/route.ts`**
   - Already had blocked user prevention ✅
   - Returns 403 for inactive users

---

## 🎉 Benefits of This Implementation

✅ **Security**: Blocked entities are truly hidden from unauthorized users
✅ **Admin Control**: Admins maintain full visibility for management
✅ **Clear Visual Feedback**: Immediate indication of blocked status
✅ **Consistent UX**: Same filtering logic across all endpoints
✅ **Database Efficient**: Filtering at query level (not in code)
✅ **Role-Based**: Respects user roles and permissions
✅ **Scalable**: Easy to extend to other entity types

---

## 🚀 Next Steps (Optional Enhancements)

1. **Prevent Blocked Kitchens from Creating Batches**:
   - Add kitchen status check in batch creation endpoint
   - Return error if kitchen is blocked

2. **Token Revocation for Blocked Users**:
   - Implement token blacklist
   - Force logout when user is blocked

3. **Cascade Effects**:
   - Auto-expire batches when kitchen is blocked?
   - Archive batches instead of hiding?

4. **Audit Logging**:
   - Log when kitchens/users are blocked/unblocked
   - Track who performed the action

5. **Notification System**:
   - Notify kitchen staff when their kitchen is blocked
   - Email notification to affected users

---

## ✅ Summary

**Blocked kitchens and users are now properly filtered throughout the system:**

- 🔐 Blocked users cannot login
- 🚫 Blocked kitchens hidden from non-admin users
- 📦 Batches from blocked kitchens filtered for non-admins
- 👁️ Admins see everything with clear visual indicators
- 🎯 Role-based access control working correctly

**All filtering is done at the database query level for optimal performance!**
