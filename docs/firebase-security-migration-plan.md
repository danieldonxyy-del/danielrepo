# KlabatSync Firebase integration and migration

## Production data model

The application uses these Firestore paths. Demo fixtures and localStorage remain separate and are not copied to Firestore automatically.

| Path | Contents and authority |
|---|---|
| `users/{uid}` | Student profile fields only; the signed-in, verified student can edit allowed profile fields. Roles and organization scope are never stored as trusted user-editable fields. |
| `users/{uid}/bookmarks/{eventId}` | A student's private saved-event list. |
| `users/{uid}/agenda/{eventId}` | A student's private personal agenda events. |
| `users/{uid}/announcementReads/{announcementId}` | Per-student announcement read state. |
| `admins/{uid}` | Trusted admin profile, role, status, and organization assignment. Cloud Functions/Admin SDK only may write this collection. |
| `organizations/{orgId}` | Campus organizations. Super Admin manages lifecycle; an assigned organization admin may edit limited profile fields. |
| `events/{eventId}` | Campus and organization events. Student reads are limited to published events; admin reads/writes are role- and organization-scoped. |
| `registrations/{uid}_{eventId}` | RSVP and attendance state, including event category and organization scope. Student RSVP changes and trusted admin check-in are performed by callable functions; clients cannot write registration tokens or attendance state directly. |
| `announcements/{announcementId}` | Campus and organization announcements. Student read state is stored in their private subcollection, not shared on the announcement. |
| `_system/firstSuperAdminBootstrap` | A one-time marker written by the protected bootstrap callable. Client access is denied. |

The admin document is authoritative for role/status/scope checks in Firestore Rules. Custom claims are maintained for token consumers, but are not the Firestore Rules source of truth. A suspended or revoked admin document immediately loses rule-authorized access; the client also watches the admin profile and signs out when the status is no longer active.

## Application workflows connected in code

- Google student login requires a verified `@student.unklab.ac.id` email.
- Student email/password registration sends a Firebase verification email; login is rejected until the account is verified and uses the same student domain.
- Admin email/password login reads `admins/{uid}` and requires an active, verified admin account.
- Events, organizations, announcements, admin profiles, student registrations, bookmarks, announcement-read state, and personal agenda load from Firestore listeners for production sessions. Organization-scoped roles use organization-filtered queries; ORMAWA, dormitory, and spiritual administrators are additionally category-scoped.
- Event/organization/announcement writes and bookmark/agenda mutations use Firestore. RSVP changes use the `setEventRSVP` callable, which creates registration tokens server-side. Writes do not fall back to local fixtures on failure; errors are shown in the app.
- Attendance check-in uses the `checkInAttendance` callable and revalidates the caller's active role, organization, and category scope inside the Firestore transaction.
- Demo Mode continues to use the existing mock data and localStorage services. Choosing Demo Mode never writes those records to Firestore.

The migration is additive. Existing mock/localStorage records are not overwritten or bulk-uploaded. Existing Firestore documents that lack current fields are not automatically normalized; migrate/back up them before enabling production rules.

## Trusted administrator provisioning

1. Create the first Firebase Authentication user in the Firebase Console and verify its email.
2. Set the one-time Cloud Functions secret `SUPER_ADMIN_BOOTSTRAP_KEY` in Secret Manager.
3. Use the Auth page's one-time bootstrap panel with that account and key. The callable requires a verified signed-in user, uses a transaction and a marker, and can succeed only once.
4. After bootstrap, Super Admins can provision an administrator only when that user's Firebase Authentication account already exists and has a verified email. Provisioning assigns the role/scope and custom claims through `provisionAdminRole`.
5. To deliver new administrator invitations or create Auth accounts automatically, configure an email delivery/invitation workflow separately. The current project has no mail provider and does not claim to send invitations.

The bootstrap key is not a Vite variable and must never be placed in frontend environment files:

```powershell
firebase functions:secrets:set SUPER_ADMIN_BOOTSTRAP_KEY
```

## Required manual Firebase setup

No deployment was run by this implementation.

1. In Firebase Console, enable Authentication providers: Google and Email/Password. Confirm the authorized web domains and verification-email configuration.
2. Enable Firestore in the intended Firebase project. Back up existing Firestore data before changing rules.
3. Configure the `SUPER_ADMIN_BOOTSTRAP_KEY` Functions secret as described above.
4. Install/use Firebase CLI, authenticate, and select the intended project. Confirm `firebase use` targets `frontend-bbek` before deployment.
5. Deploy rules and functions only after reviewing the target project and migration data:

   ```powershell
   firebase deploy --only firestore:rules,functions
   ```

6. Create/verify the initial Auth account, run the one-time bootstrap, then provision additional admins. The Admin Management screen requires a pre-existing, verified Firebase Auth user; it is not an email sender.
7. Test a student, each admin role, suspension/revocation, registration/check-in, and two separate organizations in a staging project before production rollout.

## Limits and safety notes

- This code has not been deployed or tested against a live Firebase project. Production enforcement is not active until the rules and functions are deployed.
- There is no automatic migration from localStorage/demo fixtures to Firestore.
- An admin invitation email provider, App Check enforcement, and live Firebase Emulator/rules test suite are not configured here.
- Verify and migrate existing event/announcement documents to the current required fields (`id`, event status, `isDemo: false`, and correct `organizationId`) before production use. Registration documents need a correct `category` and `organizationId` copied from their event before organization-scoped administrators can query or check them in.
- Never put service-account keys, Functions secrets, or the bootstrap key in the browser bundle or source control.
