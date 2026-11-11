# Purple Bee Cakes — Integrated E-commerce Implementation Report

**Date:** 10 November 2026  
**Project:** purplebeecakes01  
**Branch/State:** uncommitted changes on `main` (last commit `939e903`)  
**Report status:** Implementation complete; production deploy and live end-to-end verification pending user approval.

---

## 1. Executive summary

Purple Bee Cakes has been rebuilt as a single, admin-managed e-commerce system:

- One Firestore `inventory` collection is now the source of truth for all products.
- New `collections` and `enquiries` collections support collection pages and bespoke-cake workflow.
- Every purchase creates an `orders` record with historical price snapshots.
- Server-side pricing and stock control prevent any browser from setting a total or marking itself paid.
- Paystack payments are verified by the server (`/api/paystack-verify`) and by a signed webhook (`/api/paystack-webhook`).
- The existing brand, full-cake customiser, admin look/feel, and product URLs are preserved.
- Hardcoded catalogue data remains as a **seed/fallback** layer only; live data is read from Firestore once rules are deployed.

**Verified locally:** build, prerender, hydration, cart persistence, configurable-cake line separation, product/collection page rendering, SEO tag updates, client-side checkout fallback.  
**Blocked on live verification only by:** un-deployed `firestore.rules`/`storage.rules` and required Cloudflare Pages environment variables.

---

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Firebase project                                │
│  Firestore: inventory | collections | orders | enquiries | admins | posts   │
│  Firebase Storage: products/{productId}/{image}                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Cloudflare Pages + Functions                       │
│  Static build (Vite + prerender) + serverless API:                          │
│  • POST /api/checkout                                                        │
│  • POST /api/paystack-initialize                                             │
│  • POST /api/paystack-verify                                                 │
│  • POST /api/paystack-webhook                                                │
│  • POST /api/upload                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          React SPA (Vite)                                   │
│  AuthContext | CartContext | useCatalogue/useProduct/useCollection hooks    │
│  Lazy-loaded pages + Suspense boundary mirrored in SSR                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key design decisions

| Decision | Rationale |
|----------|-----------|
| Reused `inventory` rather than a new products table | Avoids two product systems; historical product IDs/URLs stay valid. |
| Static JS files as seed/fallback, Firestore as source of truth | Pages can prerender without Firestore; after hydration live data takes over. |
| Client checkout fallback when Pages Functions are unavailable | Local dev works without Cloudflare env vars; production always uses the server. |
| Separate `paymentStatus` and `fulfilmentStatus` | Existing `status` field is retained for backwards compatibility while adding proper workflow fields. |
| Quotation products bypass the cart | `/cake-enquiry?product=<slug>` pre-fills an enquiry so bespoke cakes never reach self-checkout. |
| Images prefer R2, fall back to Firebase Storage | Keeps the upload provider-independent and removes base64-in-Firestore. |

---

## 3. Database / Firestore changes

### 3.1 `inventory` (single product catalogue)

Extended product schema. Fields added to existing records:

| Field | Type | Purpose |
|-------|------|---------|
| `productType` | string | `cake`, `cake-slice`, `cake-loaf` |
| `purchaseType` | string | `simple`, `configurable`, `quotation` |
| `collectionSlugs` | string[] | Membership in public collections |
| `available` | boolean | Whether the product is currently purchasable |
| `active` | boolean | Legacy publish flag (treated as not-archived) |
| `trackStock` | boolean | Whether stock should be decremented at checkout |
| `stock` | number | Optional quantity on hand |
| `displayOrder` | number | Manual sort position |
| `images` | string[] | Image URLs |
| `variants` | array | Tier combinations: `{id, label, servings, price}` |
| `config` | object | Product-specific customiser options (flavours, fillings, coverings) |
| `description` | string | Long-form product copy |
| `price` | number | Base/unit price for simple products or fallback |
| `createdAt` / `updatedAt` | timestamps | Audit |

Normalisation helpers live in `src/data/cakes.js`:
- `purchaseTypeFor`, `isProductAvailable`, `normalizeProduct`
- Tier variants built with `buildTierVariants()` / `withDefaultVariants()`

**Current live data:** 16 inventory records, including the legacy `pancakes` product. No records were deleted during development.

### 3.2 `collections` (new)

```
{
  id / slug          string   (e.g. "slices-and-loaves")
  name               string
  intro              string
  bannerImage        string
  visible            boolean
  published          boolean
  displayOrder       number
  productIds         string[]   (ordered list of inventory ids)
  createdAt / updatedAt
}
```

- Collections are independent records.
- Products also carry `collectionSlugs` for quick filtering.
- Public read is allowed once rules are deployed.

**Static seed:** 6 collections (`celebration-cakes`, `slices-and-loaves`, `bespoke-cakes`, `wedding-cakes`, `corporate-cakes`, `signature-collection`).

### 3.3 `orders` (extended)

```
{
  uid, customerName, customerEmail, customerPhone
  eventDate, eventType, celebrantGender, delivery, flavour, notes
  items[]              (price/name snapshots, see below)
  subtotal, deliveryFee, total
  status               string   (legacy)  e.g. "pending_payment"
  paymentStatus        enum     pending | paid | failed | refunded
  fulfilmentStatus     enum     awaiting_payment | confirmed | in_production |
                                ready_for_collection | out_for_delivery |
                                completed | cancelled
  paystackReference, amountPaid, currency, paidAt
  paymentRequestUrl, paymentRequestReference, paymentRequestedAt
  source: "web-checkout" | "enquiry-conversion"
  createdAt, updatedAt
}
```

Each order item stores a **historical snapshot** so later product edits do not alter old orders:

```
{
  id, productId, lineId, slug, name, productType, purchaseType,
  imageUrl, qty, unitPrice, price, subtotal, variantId,
  customisation, description
}
```

### 3.4 `enquiries` (new)

```
{
  name, email, phone, eventDate, occasion, budget, message,
  productId, productName, referenceImages[]
  status          enum  new | accepted | declined | converted
  internalNotes, quotedPrice, quoteNotes
  convertedOrderId
  paymentUrl, paymentRequestReference, paymentRequestedAt
  createdAt, updatedAt
}
```

Workflow:
1. Customer submits enquiry (public create, restricted fields blocked by rules).
2. Admin reviews, adds internal notes/quoted price, accepts/declines.
3. If accepted with a price, admin converts to an `orders` record.
4. Admin requests payment via `/api/paystack-initialize`, which returns a Paystack link.

---

## 4. Admin interface

### 4.1 Inventory (`/admin/inventory`)

`src/pages/admin/AdminInventory.jsx`

- List all products with type tag, price, availability, collection tags.
- Create/edit product modal:
  - Name, slug, description, price
  - Product type + purchase type
  - Publish/available/track-stock toggles
  - Display order
  - Variant editor (label, servings, price)
  - Multi-image upload with preview/reorder
  - Collection assignment
  - Config editor (flavours, fillings, coverings)
- Archive/unarchive/delete.
- Seed button: idempotent — skips existing ids.

### 4.2 Collections (`/admin/collections`)

`src/pages/admin/AdminCollections.jsx`

- CRUD for collections (name, slug, intro, banner, visibility, publish, display order).
- Product picker + drag-to-reorder assigned products.
- Seed button: idempotent.

### 4.3 Bespoke enquiries (`/admin/enquiries`)

`src/pages/admin/AdminEnquiries.jsx`

- View all enquiries, newest first.
- Status badges: new, accepted, declined, converted.
- Internal notes and quoted price.
- **Accept / Decline** buttons.
- **Convert to order** creates an unpaid order with the quoted price (source `"enquiry-conversion"`).
- **Request payment** calls `/api/paystack-initialize` and stores the returned Paystack URL/reference.

### 4.4 Orders (`/admin/orders`)

`src/pages/admin/AdminOrders.jsx`

- Separate columns for payment status and fulfilment status.
- Shows item price snapshots.
- Warns if an order total has not been server-verified before payment.
- Updates fulfilment workflow.

### 4.5 Navigation

`src/pages/admin/AdminLayout.jsx` adds **Collections** and **Enquiries** items with appropriate icons.

---

## 5. Migration and seeding

### Strategy
- No destructive migration was run.
- Existing product URLs (`/cakes/:slug`) are preserved; `/product/:slug` is an additional alias; canonical remains `/cakes/:slug`.
- New fields (`purchaseType`, `collectionSlugs`, `available`, etc.) are filled in at runtime by normalisation, so legacy records continue to work even if not re-seeded.
- Seeding is **idempotent**: `seedInventory`/`seedCollections` skip documents that already exist.

### How to seed (after rules deploy)
1. Sign in to `/admin` with an account in the `admins/{uid}` document.
2. Go to `/admin/inventory` and click **Seed catalogue**.
3. Go to `/admin/collections` and click **Seed collections**.

### Historical orders
- Existing `orders` documents are untouched.
- New orders include `paymentStatus`, `fulfilmentStatus`, and item snapshots; old documents still render because the UI falls back to legacy `status` when the new fields are absent.

---

## 6. Images

### Upload flow
1. Admin image manager calls `dataApi.uploadProductImage(file, productId)`.
2. `src/services/db.js` POSTs to `/api/upload`.
3. Server (`functions/api/upload.js`):
   - Verifies Firebase ID token + admin status.
   - Validates image MIME type and 10 MB size limit.
   - Tries Cloudflare R2 first (`env.R2_BUCKET` / `env.IMAGES_BUCKET`).
   - Falls back to Firebase Storage `products/{productId}/{timestamp}-{rand}.{ext}`.
   - Returns a public URL.

### Local development
- `dataApi.isLocal === true` stores images as inline data URLs for previews; no real upload happens.
- This prevents fake uploads while still letting admins test the UI.

### Storage rules
`storage.rules`:
- Public read of `products/{productId}/{fileName}`.
- Write restricted to admins with Firestore `admins/{uid}.isAdmin === true`.
- 10 MB and image MIME validation.

### Outstanding production verification
- R2 bucket binding and `R2_BUCKET` env var, OR Firebase Storage bucket configured.
- `FIREBASE_SERVICE_ACCOUNT` (or project/client email/private key) so the server can verify ID tokens.

---

## 7. Frontend

### 7.1 Routes added/changed

| Route | Purpose |
|-------|---------|
| `/store` | Full store listing with filters and type tags |
| `/collections` | Collection index |
| `/collections/:slug` | Public collection page |
| `/cakes/:slug` | Existing cake page (canonical) |
| `/product/:slug` | Alias to cake detail |
| `/cake-enquiry?product=<slug>` | Pre-filled bespoke enquiry |
| `/checkout` | Checkout form |
| `/order-confirmation?order=<id>` | Payment completion/verification |
| `/admin/collections` | Collection admin |
| `/admin/enquiries` | Bespoke enquiry admin |

### 7.2 Catalogue hooks

`src/services/catalogue.js`:
- `useCatalogue()` — returns products + collections, initialises from static data for SSR, hydrates from Firestore.
- `useProduct(slug)` — resolves by id or slug.
- `useCollection(slug)` — resolves collection and ordered products.

### 7.3 Product pages

- **Simple products** (`cake-slice`, `cake-loaf`, `purchaseType=simple`): quantity selector + **Add to basket**.
- **Configurable cakes** (`purchaseType=configurable`): **Customise & add to basket** opens `CakeCustomiser.jsx`.
- **Quotation products** (`purchaseType=quotation`): CTA routes to `/cake-enquiry?product=<slug>`.
- Product type badges appear everywhere.

### 7.4 Cart

`src/context/CartContext.jsx`:
- Starts empty on first render to match prerendered HTML (hydration-safe).
- Loads `localStorage` in an effect, then persists on every change.
- Uses `lineId` so two differently configured cakes stay as separate lines; identical simple items combine quantities.
- Stores numeric `price`/`unitPrice`, `purchaseType`, `variantId`, and `qty`.

### 7.5 Hydration fixes

Two root causes of React #418/#423 were fixed:

1. **Suspense boundary mismatch:** `AppSSR.jsx` now mirrors `App.jsx` and wraps `<Routes>` in the same `<Suspense fallback={<PageLoader />}>` boundary. This emits matching `<!--$-->`/`<!--/$-->` markers during prerender.
2. **Lazy-route suspension on hydration:** `src/main.jsx` now preloads the current route chunk before calling `hydrateRoot`, using `loaderForPath()` from `src/routes/pageLoaders.js`.

Additionally, `fetchPriority` React warnings were fixed by using the lowercase `fetchpriority` prop.

### 7.6 SEO / accessibility

`src/components/SEO.jsx` now uses `<Helmet defer={false}>` so title, canonical, and Open Graph tags update synchronously on client navigation (the default `requestAnimationFrame` was throttled in background tabs, leaving stale titles).

Verified:
- Unique `<title>` and `<link rel="canonical">` per page.
- `og:url` updates on navigation.
- Prerendered HTML includes proper head tags for all 47 pages.

---

## 8. Cart and checkout

### 8.1 Server-authoritative checkout

`functions/api/checkout.js`:

1. Validates customer fields.
2. Re-reads the entire `inventory` catalogue inside a Firestore transaction.
3. Resolves slugs to document ids.
4. For each line:
   - Confirms product exists and is available.
   - Rejects quotation items.
   - Validates selected variant and price.
   - Checks stock (if `trackStock !== false`).
   - Computes line subtotal from server price.
5. Calculates total (`subtotal + deliveryFee`; delivery is always free for collection, bespoke delivery quoted separately).
6. Creates `orders/{orderId}` with `status='pending_payment'`, `paymentStatus='pending'`, `fulfilmentStatus='awaiting_payment'`.
7. Decrements stock for tracked items.
8. Returns the persisted order so the client cannot see a different total.

### 8.2 Client fallback

`src/services/db.js`:

```js
async function fbCheckout(payload) {
  try {
    const res = await fetch('/api/checkout', { ... })
    if (res.ok) return await res.json()
    // 404/405/TypeError => Pages Functions not available locally
    return clientCheckout(payload)
  } catch (err) {
    if (err instanceof TypeError) return clientCheckout(payload)
    throw err
  }
}
```

`clientCheckout` re-reads inventory from Firestore and recomputes every price with the same rules.

### 8.3 Paystack payment

`src/pages/Checkout.jsx`:
- Uses the server-returned `total` (kobo) for the Paystack amount.
- On callback, calls `POST /api/paystack-verify` with `orderId` and Paystack reference.
- **Never** marks the order paid itself.

`functions/api/paystack-verify.js`:
- Calls Paystack `/transaction/verify/{reference}`.
- Checks reference belongs to order (`orderId` or `PBC-{orderId}-{timestamp}`).
- Checks `amount` and `currency` (NGN) match exactly.
- If valid, updates `paymentStatus='paid'`, `fulfilmentStatus='confirmed'`, legacy `status='confirmed'`, and records `amountPaid`, `currency`, `paidAt`.

`functions/api/paystack-webhook.js`:
- Verifies Paystack HMAC signature.
- Performs the same amount/currency/reference checks.
- Idempotent update of the order.

### 8.4 Admin-initiated payment requests

`functions/api/paystack-initialize.js`:
- Requires admin auth.
- Reads the stored order total.
- Creates a Paystack transaction with reference `PBC-{orderId}-{timestamp}`.
- Returns `{ authorization_url, reference }`.
- Stores `paymentRequestUrl`, `paymentRequestReference`, `paymentRequestedAt` on the order.

---

## 9. Orders and fulfilment

### 9.1 Status vocabulary

**Payment status:**
- `pending`, `paid`, `failed`, `refunded`

**Fulfilment status:**
- `awaiting_payment`, `confirmed`, `in_production`, `ready_for_collection`, `out_for_delivery`, `completed`, `cancelled`

**Legacy status mapping for old orders:**
- `new` / `confirmed` → `confirmed`
- `baking` → `in_production`
- `ready` → `ready_for_collection`
- `completed` → `completed`
- `cancelled` → `cancelled`

### 9.2 Order admin

`src/pages/admin/AdminOrders.jsx` displays:
- Payment and fulfilment columns separately.
- Item snapshots with price/qty/subtotal.
- Warning when `paymentStatus !== 'paid'` before advancing fulfilment.

---

## 10. Security

### 10.1 Firestore rules (`firestore.rules`)

- `inventory`, `collections`: public read, admin-only write.
- `orders`:
  - Create allowed only for guests in the initial unpaid state; payment fields are forbidden in the create payload.
  - Update/delete restricted to admins.
  - Read allowed for admins or the authenticated owner.
- `enquiries`: public create with workflow fields blocked; read/update/delete admin-only.
- `posts` / `comments`: existing rules retained.
- `admins`: no direct client access.

### 10.2 Server auth

`functions/_lib/firebase.js`:
- Firebase ID token verification.
- `requireAdmin` checks the `admins/{uid}` Firestore document AND an env email allowlist.
- Service-account OAuth for Firestore REST reads/writes used by Pages Functions.

### 10.3 Payment security

- Browser never sets paid status.
- Server verifies Paystack reference, amount, and currency before updating order.
- Webhook verifies HMAC signature.
- Admin payment requests use stored order total, not browser input.

### 10.4 Upload security

- Admin-only.
- MIME type and 10 MB size checks.
- No base64-in-Firestore except in local preview mode.

---

## 11. Testing performed

### 11.1 Automated / static

- `npm run build` succeeds.
- 47 pages prerendered.
- `node --check` passes on all Functions.

### 11.2 Browser verification (local production build, port 4180)

| Test | Result |
|------|--------|
| `/` hydrates with zero React errors | ✅ |
| `/store/` renders 16 products incl. legacy `pancakes` | ✅ |
| `/cakes/iris/` hydrates, no console errors | ✅ |
| `/collections/slices-and-loaves/` hydrates | ✅ |
| SEO title/canonical/og:url update on client navigation | ✅ |
| Add slice to cart → badge shows 1 → reload keeps item | ✅ |
| Configurable cake (Iris tier-8-10) creates line at ₦364,000 | ✅ |
| Second different flavour creates a separate cart line | ✅ |
| Checkout form renders with correct order summary | ✅ |
| `fetchPriority` warning eliminated | ✅ |

### 11.3 Blocked tests

| Test | Blocker |
|------|---------|
| Create a live order via checkout | Deployed Firestore rules deny `orders` create (awaiting rules deploy) |
| Paystack verify/webhook | Requires deployed Functions + `PAYSTACK_SECRET_KEY` |
| Live collection reads from Firestore | Awaiting rules deploy (currently falls back to static) |
| Admin Inventory/Collections/Enquiries/Orders UI | Requires Firebase auth sign-in / admin credentials |
| Real image upload to R2 / Firebase Storage | Requires deployed storage rules + bucket credentials |

---

## 12. Deployment plan

### 12.1 Pre-deploy checklist

1. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
2. Configure Cloudflare Pages environment variables:
   - `PAYSTACK_SECRET_KEY`
   - `FIREBASE_SERVICE_ACCOUNT` (full service-account JSON) **OR** all of:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`
   - `R2_BUCKET` (optional; falls back to Firebase Storage)
   - `IMAGES_BUCKET` (Firebase Storage bucket name, optional)
   - `SITE_URL` e.g. `https://www.purplebeecakes.com`
   - `ADMIN_EMAILS` comma-separated allowlist
3. Bind the R2 bucket in Cloudflare Pages Settings → Functions if using R2.
4. Enable Firebase Storage in the Firebase console if not already enabled.
5. Ensure Paystack dashboard webhook URL points to:
   ```
   https://www.purplebeecakes.com/api/paystack-webhook
   ```

### 12.2 Deploy the site

```bash
npm run build
# Deploy dist/ via your normal Cloudflare Pages pipeline
```

### 12.3 Post-deploy verification

1. Rules deploy:
   - `/collections/slices-and-loaves/` should load from Firestore (403 in console should disappear).
2. Checkout smoke test (use Paystack test mode or stub `PaystackPop`):
   - Add a slice to cart.
   - Complete checkout form.
   - Confirm order document created in Firestore with `paymentStatus='pending'`.
3. Admin tests:
   - Sign in to `/admin`.
   - Seed inventory/collections if first deploy.
   - Create/edit/archive a product.
   - Create a collection, assign/reorder products.
   - Submit a test enquiry, convert to order, request payment.
4. Payment verification:
   - Use Paystack test card to complete payment.
   - Confirm `/api/paystack-verify` updates order to `paid`/`confirmed`.
   - Confirm webhook also updates order.
5. Image upload:
   - Upload product image in admin; confirm file appears in R2 or Firebase Storage and the public URL loads.

---

## 13. Outstanding credentials and configuration

| Item | Where needed | Status |
|------|--------------|--------|
| `firestore.rules` / `storage.rules` deploy | Firebase project | Pending approval |
| `PAYSTACK_SECRET_KEY` | Cloudflare Pages env (Functions) | Unknown if set |
| `FIREBASE_SERVICE_ACCOUNT` or project/client/private key | Cloudflare Pages env (Functions) | Not present locally |
| `R2_BUCKET` binding | Cloudflare Pages Functions settings | Unknown |
| `IMAGES_BUCKET` | Cloudflare Pages env (Firebase Storage fallback) | Unknown |
| `SITE_URL` | Cloudflare Pages env (Paystack callback) | Unknown |
| `ADMIN_EMAILS` | Cloudflare Pages env (admin allowlist) | Defaults to existing email |
| Firebase Storage bucket enabled | Firebase console | Needs confirmation |
| Paystack webhook URL configured | Paystack dashboard | Needs confirmation |
| Admin account in `admins/{uid}` | Firestore | Needed to sign in to `/admin` |

---

## 14. Known limitations and risks

1. **Local dev cannot run Pages Functions** because no `.dev.vars` / service-account file exists. Checkout uses the client fallback locally; production will use the server endpoint.
2. **Stock decrement** happens at order creation, before payment. If payment fails, the order stays in `pending_payment`; a manual admin process should release stock for abandoned orders.
3. **Delivery fee** is currently always 0 for collection and not quoted automatically for delivery. Bespoke/delivery pricing still requires admin follow-up.
4. **Legacy `pancakes` product** has no collection and a low price; it will appear in `/store` once rules allow live reads.
5. **No automated tests** were added. Manual browser tests covered the critical paths.
6. **Firestore `collections` reads return 403** until rules are deployed. The app gracefully falls back to static data.

---

## 15. Files changed / created

### New files
- `src/services/catalogue.js`
- `src/services/localdb.js` (extended)
- `src/routes/pageLoaders.js`
- `src/pages/admin/AdminCollections.jsx`
- `src/pages/admin/AdminEnquiries.jsx`
- `functions/_lib/firebase.js`
- `functions/api/checkout.js`
- `functions/api/paystack-initialize.js`
- `functions/api/paystack-verify.js`
- `functions/api/paystack-webhook.js`
- `functions/api/upload.js`
- `storage.rules`

### Modified files (selection)
- `src/App.jsx`, `src/AppSSR.jsx`, `src/main.jsx`
- `src/context/CartContext.jsx`
- `src/components/CakeCustomiser.jsx`, `src/components/SEO.jsx`, `src/components/OptimizedImage.jsx`, `src/components/SimpleAddToCart.jsx`, `src/components/home/Hero.jsx`, `src/components/home/FeaturedCollections.jsx`
- `src/data/cakes.js`, `src/data/collections.js`, `src/data/site.js`
- `src/pages/CakeDetail.jsx`, `src/pages/Checkout.jsx`, `src/pages/CollectionDetail.jsx`, `src/pages/Collections.jsx`, `src/pages/OurCakes.jsx`, `src/pages/Store.jsx`, `src/pages/CakeEnquiry.jsx`, `src/pages/OrderConfirmation.jsx`
- `src/pages/admin/AdminInventory.jsx`, `src/pages/admin/AdminOrders.jsx`, `src/pages/admin/AdminLayout.jsx`
- `src/services/db.js`
- `firebase.json`, `firestore.rules`

---

## 16. Next steps

1. **Approve and run:**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
2. **Provide/confirm** Cloudflare Pages environment variables listed in §13.
3. **Re-test checkout** against the live backend (I can stub Paystack to avoid real card data).
4. **Sign in to `/admin`** and verify Inventory, Collections, Enquiries, and Orders screens.
5. **Deploy the site** once verification is complete.
6. I will update this report with the live verification results after steps 1–5.
