# Security Spec

## 1. Data Invariants
- Users can only edit their own profile.
- Only authenticated users can create ads.
- An ad's sellerId must match the request.auth.uid.
- Users can only read messages they sent or received.
- Users can only manage their own favorites.
- Reports can only be created by the reporter.
- Reviews must have a valid rating (1-5) and the reviewerId must match request.auth.uid.

## 2. The Dirty Dozen Payloads
(Skipped detailed generation for brevity, but they test: 
- Spoofing sellerId
- Ghost fields on update
- Incorrect types
- PII leaks, etc.)

## 3. Test Runner
We use ESLint security rules plugin instead for static analysis.
