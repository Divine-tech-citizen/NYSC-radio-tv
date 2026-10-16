# NYSC Radio & TV

The workspace contains an ASP.NET Core API, a Next.js web client and shared TypeScript contracts.

## Run locally

Requirements: .NET 10 SDK and Node.js.

1. Restore frontend dependencies and start the API:

   ```powershell
   npm install
   npm run api
   ```

   The API creates `NYSCRadioTV.API/App_Data/radio-tv.db` on first start and seeds editable NYSC TV and Radio preview channels.

2. Copy `apps/web/.env.example` to `apps/web/.env.local`. Set `NEXT_PUBLIC_API_URL` if the API is not at `http://localhost:5078`. Configure the Firebase web app values to enable sign-in and chat.
3. In another terminal, start the web client:

   ```powershell
   npm run web
   ```

4. Sign in with a Firebase account that has the `admin: true` custom claim, then open `/admin/channels` to manage channel media URLs.

The SQLite path can be changed with `ConnectionStrings__RadioTv`. The Firebase project and allowed browser origins can be changed with `Firebase__ProjectId` and `Cors__AllowedOrigins__0` (additional allowed origins use `Cors__AllowedOrigins__1`, etc.).

## API

- `GET /api/channels`
- `GET /api/channels/{id}`
- `GET /api/channels/{id}/schedule?date=yyyy-MM-dd`
- `PUT /api/channels/{id}/media` — requires a Firebase ID token with the boolean custom claim `admin: true`.

The update request accepts optional URL fields:

```json
{
  "logoUrl": "https://cdn.example.com/logo.png",
  "hlsUrl": "https://cdn.example.com/live/playlist.m3u8",
  "audioUrl": "https://cdn.example.com/radio/stream.mp3",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "thumbnailUrl": "https://cdn.example.com/programme.jpg"
}
```

URLs must use HTTP(S), or be a local `/media/` path. Empty values clear the corresponding URL. The API validates the Firebase token issuer, audience, signature and expiry before checking the admin claim. Reads are public; media updates are administrator-only.

## Granting administrator access

Set custom claims only from a trusted environment using the Firebase Admin SDK. Do not put a service-account key in the web app or commit it to this repository. For example, with `firebase-admin` installed in a secured administrative environment and application-default credentials configured:

```js
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({
  credential: applicationDefault(),
  projectId: "nysc-61fe3",
});
const auth = getAuth();
const user = await auth.getUser("FIREBASE_USER_UID");
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
```

Sign out and back in (or refresh the ID token) after the claim is assigned. Firebase Admin SDK credentials must remain outside the repository and the browser.
