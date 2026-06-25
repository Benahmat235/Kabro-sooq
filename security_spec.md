# Security Specification for Kabro Sooq (Firebase Rules TDD)

## 1. Data Invariants
- A listing must have a valid sellerId that matches the authenticated user during creation.
- Only the seller of a listing can update or delete their listing.
- A user profile must match the authenticated user's UID.
- Chats can only be read or created by users who are participants in the chat (buyerId or sellerId).
- Messages within a chat can only be read or written by participants of the parent chat.

## 2. The "Dirty Dozen" Spoof/Attack Payloads
1. **Unauthenticated Listing Creation**: Write to `/listings/123` with no auth context.
2. **Identity Spoofing in Listing**: Create listing as Authenticated User A but set `sellerId` to User B.
3. **Price Poisoning**: Create a listing with negative price or non-number price.
4. **Size/DoS Attack on Listing Title**: Create a listing with a 1MB title.
5. **Unauthorized Listing Edit**: Authenticated User B attempts to edit User A's listing.
6. **Chat Snooping**: User C tries to read `/chats/chatAB` where they are neither the buyer nor the seller.
7. **Message Spoofing**: User B writes a message into `/chats/chatAB` with `senderId` set to User A.
8. **Shadow Field Injection**: Update listing with a ghost field `sellerIsVerified: true` (unauthorized elevation).
9. **Profile Stealing**: Authenticated User A tries to write profile data to `/users/UserB`.
10. **Immutable Field Tampering**: Try to update `createdAt` or `sellerId` on a listing.
11. **Client-side Time Spoofing**: Write a listing with `createdAt` set to a future/past date instead of `request.time`.
12. **Bypassing Verification**: Write a message as unverified email user when verification is required (if applicable).

## 3. Test Runner Concept (Conceptual firestore.rules.test.ts)
We enforce these blocks directly via our production `firestore.rules`.
