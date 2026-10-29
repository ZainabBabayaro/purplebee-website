# Connecting Firebase

The store, checkout and admin pages work locally using a localStorage-based
fallback. To connect a real Firebase project, follow these steps.

---

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project (e.g. `purplebeecakes`).
3. Enable **Authentication** → Email/Password sign-in method.
4. Enable **Firestore** → Start in **production mode** (rules will be deployed).

---

## 2. Paste your config

Open `src/config/firebase.js` and replace the placeholder values with
your project's Firebase config (found under Project Settings → Your apps):

```js
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'purplebeecakes.firebaseapp.com',
  projectId: 'purplebeecakes',
  storageBucket: 'purplebeecakes.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456...',
}
```

Also set your owner email in `ADMIN_EMAILS`:

```js
export const ADMIN_EMAILS = ['your@email.com']
```

---

## 3. Deploy Firestore security rules

```bash
npm install -g firebase-tools     # one-time
firebase login
firebase init firestore           # choose existing project
firebase deploy --only firestore:rules
```

The rules file is `firestore.rules` in the project root.

---

## 4. Create your admin account

1. Go to **Authentication** in the Firebase console.
2. Add a user manually with your email and a strong password.
3. Copy the UID that appears.
4. In the Firestore console, create a document at:
   ```
   Collection: admins
   Document ID: <your UID>
   Field: isAdmin = true (boolean)
   ```

This is the only way to grant admin access — the client cannot modify
the `admins` collection (blocked by security rules).

---

## 5. Seed inventory on first run

On first run with Firebase configured, the store catalog will be empty until
you populate the `inventory` collection. Either:

- Manually add documents in the Firestore console matching the shape in
  `src/data/cakes.js`, or
- Use the admin **Inventory** page which reads from Firestore directly once
  the cakes data is in the database.

A one-time seeding script is being added in a future update, or you can run
the dev server with the local fallback (no Firebase config) which auto-seeds
from the cakes data file.

---

## Security notes

- Firestore rules enforce all data access server-side — the client config is
  public by design and cannot be used to bypass rules.
- The `admins` collection is unreadable from the client — nobody can probe
  which UIDs have admin access.
- Customers can only read/write their own orders; they cannot update an order
  after placement.
- Guest checkout orders (uid: 'guest') are only readable by admins.
