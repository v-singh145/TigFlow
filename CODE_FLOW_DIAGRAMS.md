# 🔄 Atomic Hiring - Code Flow Diagrams

## High-Level Flow

```
POST Request: /api/bids/:bidId/hire
        ↓
    ┌───────────────────────────────────┐
    │ Start MongoDB Transaction         │
    │ (Begins atomic operation)         │
    └───────────┬───────────────────────┘
                ↓
    ┌───────────────────────────────────┐
    │ Fetch Bid with Session Lock 🔒    │
    │ (No other transaction can modify) │
    └───────────┬───────────────────────┘
                ↓
    ┌───────────────────────────────────┐
    │ Fetch Gig with Session Lock 🔒    │
    │ (No other transaction can modify) │
    └───────────┬───────────────────────┘
                ↓
    ┌───────────────────────────────────┐
    │ Verify User is Gig Owner          │
    └───────┬───────────────────────────┘
            ↓
        ┌─────────────────┐
        │ Is Owner?       │
        └────┬────────────┘
             │
        ┌────┴─────────┐
        ❌ YES          ❌ NO
        │               │
        ↓               ↓
    Continue      Return 403
                  (Unauthorized)
                       │
                       ├─ Abort Transaction
                       └─ Response: "Only gig owner can hire"
        │
        ↓
    ┌─────────────────────────────────┐
    │ 🔒 CRITICAL CHECK:              │
    │ Is gig.status === 'open' ?      │
    │ (Race condition prevention)     │
    └────────┬────────────────────────┘
             ↓
        ┌────────────────────┐
        │ Status = 'open'?   │
        └────┬───────────────┘
             │
        ┌────┴────────────────┐
        ✅ YES                ❌ NO
        │                     │
        ↓                     ↓
    Continue         Return 400 (Bad Request)
                     │
                     ├─ Abort Transaction
                     └─ Response: "Gig is no longer open
                                  (Someone else hired)"
        │
        ↓
    ┌──────────────────────────────────┐
    │ Verify Bid Status = 'pending'    │
    └────────┬───────────────────────┘
             ↓
        ┌────────────────────┐
        │ Status = pending?  │
        └────┬───────────────┘
             │
        ┌────┴────────────────┐
        ✅ YES                ❌ NO
        │                     │
        ↓                     ↓
    Continue         Return 400
                     │
                     ├─ Abort Transaction
                     └─ Response: "Bid is no longer pending"
        │
        ↓
    ┌──────────────────────────────────┐
    │ ✅ ALL CHECKS PASSED             │
    │ Execute Atomic Updates:          │
    │                                  │
    │ 1️⃣  Bid.status = 'hired'         │
    │ 2️⃣  Bid.hiredAt = now()          │
    │ 3️⃣  Gig.status = 'assigned'      │
    │ 4️⃣  Gig.hiredBidId = bid._id    │
    │ 5️⃣  Gig.hiredAt = now()          │
    │ 6️⃣  Other bids: 'rejected'       │
    └────────┬───────────────────────┘
             ↓
    ┌──────────────────────────────────┐
    │ COMMIT TRANSACTION ✅            │
    │ (All changes saved atomically)   │
    └────────┬───────────────────────┘
             ↓
    ┌──────────────────────────────────┐
    │ Release Lock 🔓                  │
    │ (Other transactions can proceed) │
    └────────┬───────────────────────┘
             ↓
    ┌──────────────────────────────────┐
    │ Send Real-Time Notification 📨  │
    │ (Socket.io to freelancer)        │
    └────────┬───────────────────────┘
             ↓
    ┌──────────────────────────────────┐
    │ Return 200 OK ✅                 │
    │ {                                │
    │   message: "Hired successfully", │
    │   gigId: "...",                  │
    │   bidId: "...",                  │
    │   freelancerId: "...",           │
    │   hiredAt: "2026-01-11T..."      │
    │ }                                │
    └──────────────────────────────────┘
```

---

## Race Condition Sequence Diagram

```
Timeline with TWO Concurrent Requests:

ADMIN A                                      ADMIN B
─────────────────────────────────────────────────────────

11:00:00.000
  │
  │ PATCH /api/bids/Bid-A/hire
  ├─ Start Transaction A
  └─ Acquire Lock on Gig #1 🔒
     │
11:00:00.001
     │                                      PATCH /api/bids/Bid-B/hire
     │                                      ├─ Start Transaction B
     │                                      └─ Wait for Lock... ⏳
     │
11:00:00.010
     ├─ Fetch Bid-A (locked)
     └─ Fetch Gig #1 (locked)
     │
11:00:00.020
     ├─ Check gig.status
     └─ Status = "open" ✅
     │
11:00:00.030
     ├─ Check bid.status
     └─ Status = "pending" ✅
     │
11:00:00.040
     ├─ Update Bid-A → "hired"
     ├─ Update Gig → "assigned"
     └─ Update Bid-C → "rejected"
     │
11:00:00.050
     ├─ COMMIT Transaction A ✅
     └─ Release Lock 🔓
                                            11:00:00.051
                                            ├─ Acquire Lock (released!)
                                            ├─ Fetch Bid-B (locked)
                                            └─ Fetch Gig #1 (locked)
                                            │
                                            11:00:00.060
                                            ├─ Check gig.status
                                            └─ Status = "assigned" ❌
                                            │
                                            11:00:00.070
                                            ├─ ABORT Transaction B ❌
                                            └─ Return 400 Error
                                            │
                                            Response to Admin B:
                                            ├─ Code: "GIB_NOT_OPEN"
                                            └─ Message: "Gig is no longer
                                                         open. Someone else
                                                         hired already."

Result:
═══════════════════════════════════════════════════════════
✅ Admin A: Freelancer A hired successfully
❌ Admin B: Clear error message (not "already hired")
═══════════════════════════════════════════════════════════
```

---

## Database State Changes

```
Request comes in: PATCH /api/bids/Bid-A/hire

BEFORE (Gig Document):
┌────────────────────────────────────────────────┐
│ {                                              │
│   _id: "Gig-1",                               │
│   title: "Design Website",                    │
│   status: "open",                             │
│   hiredBidId: null,                           │
│   hiredAt: null,                              │
│   ownerId: "Admin-123"                        │
│ }                                              │
└────────────────────────────────────────────────┘

BEFORE (Bid-A Document):
┌────────────────────────────────────────────────┐
│ {                                              │
│   _id: "Bid-A",                               │
│   gigId: "Gig-1",                             │
│   freelancerId: "Freelancer-X",               │
│   status: "pending",                          │
│   price: 1000,                                │
│   hiredAt: null                               │
│ }                                              │
└────────────────────────────────────────────────┘

BEFORE (Other Bids):
┌────────────────────────────────────────────────┐
│ Bid-B { status: "pending" }                   │
│ Bid-C { status: "pending" }                   │
└────────────────────────────────────────────────┘

                    ⬇️ ATOMIC TRANSACTION ⬇️

AFTER (Gig Document):
┌────────────────────────────────────────────────┐
│ {                                              │
│   _id: "Gig-1",                               │
│   title: "Design Website",                    │
│   status: "assigned",         ← CHANGED      │
│   hiredBidId: "Bid-A",        ← NEW          │
│   hiredAt: "2026-01-11T15:30:45Z", ← NEW    │
│   ownerId: "Admin-123"                        │
│ }                                              │
└────────────────────────────────────────────────┘

AFTER (Bid-A Document):
┌────────────────────────────────────────────────┐
│ {                                              │
│   _id: "Bid-A",                               │
│   gigId: "Gig-1",                             │
│   freelancerId: "Freelancer-X",               │
│   status: "hired",            ← CHANGED      │
│   price: 1000,                                │
│   hiredAt: "2026-01-11T15:30:45Z" ← NEW     │
│ }                                              │
└────────────────────────────────────────────────┘

AFTER (Other Bids):
┌────────────────────────────────────────────────┐
│ Bid-B { status: "rejected" }  ← CHANGED      │
│ Bid-C { status: "rejected" }  ← CHANGED      │
└────────────────────────────────────────────────┘

⚡ ALL CHANGES HAPPENED ATOMICALLY:
   - Either ALL succeeded
   - OR ALL were rolled back (zero changes)
```

---

## Error Paths

```
PATCH /api/bids/:bidId/hire
        │
        ├─ Bid not found?
        │  └─ ❌ Return 404: "Bid not found"
        │     └─ Abort Transaction
        │
        ├─ Gig not found?
        │  └─ ❌ Return 404: "Gig not found"
        │     └─ Abort Transaction
        │
        ├─ User is owner?
        │  └─ ❌ Return 403: "Unauthorized"
        │     └─ Abort Transaction
        │
        ├─ Gig status = 'open'?
        │  └─ ❌ Return 400: "Gig is no longer open"
        │     └─ Abort Transaction
        │     └─ (Race condition detected!)
        │
        ├─ Bid status = 'pending'?
        │  └─ ❌ Return 400: "Bid not pending"
        │     └─ Abort Transaction
        │
        ├─ Database error?
        │  └─ ❌ Return 500: "Server error"
        │     └─ Abort Transaction
        │
        └─ ✅ All checks passed
           └─ Update database
           └─ COMMIT Transaction
           └─ Return 200 OK
```

---

## Lock Acquisition Flow

```
Transaction A: PATCH /api/bids/Bid-A/hire
        ↓
    ┌─ Try to acquire lock on Gig #1
    │  └─ ✅ Lock acquired immediately
    │     (no one else has it)
    │
    └─ Execute transaction
       └─ Read Bid-A, Gig #1
       └─ Update Bid-A, Gig #1
       └─ Update Bid-B, Bid-C
       └─ COMMIT
       └─ Release lock


Transaction B: PATCH /api/bids/Bid-B/hire (same time)
        ↓
    ┌─ Try to acquire lock on Gig #1
    │  └─ ⏳ Lock is held by Transaction A
    │     (wait for it to be released)
    │
    ├─ Wait 50ms...
    │
    └─ Transaction A releases lock
       ├─ ✅ Lock acquired now
       │
       ├─ Check gig.status
       │  └─ "assigned" (A changed it!)
       │
       └─ Status check fails
          └─ ABORT Transaction
          └─ Return error
```

---

## Transaction State Machine

```
                   ┌─────────────────────┐
                   │  NOT STARTED        │
                   └──────────┬──────────┘
                              │
                    startTransaction()
                              │
                              ↓
                   ┌─────────────────────┐
                   │  ACTIVE             │
                   │  (executing)        │
                   └──────────┬──────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            commitTransaction()   abortTransaction()
                    │                   │
                    ↓                   ↓
        ┌──────────────────┐ ┌──────────────────┐
        │ COMMITTED ✅     │ │ ABORTED ❌       │
        │ (saved)          │ │ (reverted)       │
        └──────────────────┘ └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                       endSession()
                              │
                              ↓
                   ┌─────────────────────┐
                   │  CLOSED             │
                   └─────────────────────┘
```

---

## Concurrent Access Pattern

```
WITHOUT TRANSACTIONS (DANGEROUS):
───────────────────────────────────
Time    Transaction A        Transaction B
────────────────────────────────────────────
T0      Read Gig.status="open"
T1                          Read Gig.status="open"
T2      Update Gig→"assigned"
T3                          Update Gig→"assigned"
        RESULT: BOTH succeeded, data corrupted! ❌


WITH TRANSACTIONS (SAFE):
───────────────────────────────────────────────
Time    Transaction A        Transaction B
────────────────────────────────────────────
T0      Lock Gig
        Read Gig.status="open"
T1                          Wait for lock...
T2      Update Gig→"assigned"
T3      COMMIT
        Release lock
T4                          Get lock
                           Read Gig.status="assigned"
T5                         Check: "open"? NO
                           ABORT
        RESULT: A succeeded, B failed, data safe! ✅
```

---

## Error Response Examples

### Error 1: Race Condition Detected
```
Status: 400 Bad Request

{
  "message": "❌ Gig is no longer open (status: assigned). Someone else may have already hired a freelancer.",
  "code": "GIB_NOT_OPEN",
  "currentStatus": "assigned",
  "hiredBidId": "Bid-A"
}
```

### Error 2: Unauthorized
```
Status: 403 Forbidden

{
  "message": "❌ Only gig owner can hire",
  "code": "UNAUTHORIZED"
}
```

### Error 3: Bid Not Found
```
Status: 404 Not Found

{
  "message": "❌ Bid not found",
  "code": "BID_NOT_FOUND"
}
```

### Success Response
```
Status: 200 OK

{
  "message": "✅ Hired successfully",
  "gigId": "Gig-1",
  "bidId": "Bid-A",
  "freelancerId": "Freelancer-X",
  "hiredAt": "2026-01-11T15:30:45.123Z"
}
```

---

## Notification Flow After Hire

```
Hire succeeds (transaction committed)
        ↓
Check if freelancer is online
        ├─ ✅ YES: Connected socket exists
        │  └─ Send Socket.io 'hired' event immediately
        │     └─ Frontend receives notification
        │     └─ Show green banner 🎉
        │     └─ Update bell icon
        │
        └─ ❌ NO: No socket connection
           └─ Log: "Freelancer offline"
           └─ (Notification in history when they login)

Backend Console Output:
┌─────────────────────────────────────────────┐
│ ✅ ATOMIC HIRE COMPLETED SUCCESSFULLY       │
│    Freelancer: John Doe                     │
│    Socket: eiXg8JH-dpP0ZZq1AAAB             │
│                                             │
│ 📨 Real-time notification SENT              │
└─────────────────────────────────────────────┘
```

---

## Transaction Lifecycle

```
START
  │
  ├─ Fetch with session
  │  (reads locked)
  │
  ├─ Verify conditions
  │  (checks locked)
  │
  ├─ Update with session
  │  (writes locked)
  │
  ├─ More updates
  │  (more writes locked)
  │
  └─ Decision point:
     │
     ├─ All good?
     │  └─ COMMIT ✅
     │     └─ Save all changes
     │     └─ Release locks
     │
     └─ Error occurred?
        └─ ABORT ❌
           └─ Revert all changes
           └─ Release locks
           └─ Return error

END
```

---

## Key Insight Diagram

```
The Critical Moment (Race Condition Prevention)

VULNERABLE CODE (without transaction):
───────────────────────────────────────
if (gig.status == 'open') {          // Check
  gig.status = 'assigned';           // Update
}
       │
       └─ Another transaction can change status between check and update!
          Window of vulnerability: ⚠️ MICROSECONDS to MILLISECONDS


PROTECTED CODE (with transaction):
──────────────────────────────────
session.startTransaction();
if (gig.status == 'open') {          // Check (locked)
  gig.status = 'assigned';           // Update (locked)
}
session.commitTransaction();
       │
       └─ Lock held entire time! No other transaction can interfere.
          Window of vulnerability: 🔒 ZERO (impossible)
```

