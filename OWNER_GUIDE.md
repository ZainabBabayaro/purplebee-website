# Purple Bee Cakes — Owner's Guide

A practical reference for running the website, managing your store, fulfilling orders, and administering the admin portal.

---

## Contents

1. [Running the site locally](#1-running-the-site-locally)
2. [Accessing the admin panel](#2-accessing-the-admin-panel)
3. [The dashboard](#3-the-dashboard)
4. [Managing orders](#4-managing-orders)
5. [Fulfilling an order — step by step](#5-fulfilling-an-order--step-by-step)
6. [Managing inventory](#6-managing-inventory)
7. [How the store works (customer journey)](#7-how-the-store-works-customer-journey)
8. [Connecting Firebase (going live)](#8-connecting-firebase-going-live)
9. [Before launch checklist](#9-before-launch-checklist)

---

## 1. Running the site locally

Open a terminal in the project folder and run:

```bash
npm run dev
```

The site starts at **http://localhost:5173**

To build the final production version (the files you deploy):

```bash
npm run build
```

The built site is output to the `dist/` folder.

---

## 2. Accessing the admin panel

### URL

```
http://localhost:5173/admin        (development)
https://yoursite.co.uk/admin       (live site)
```

The admin login page is a separate, dark-themed screen — it is not linked from the main navigation and is not indexed by search engines.

### While running locally (no Firebase)

The site uses a local browser-based fallback until Firebase is connected. To create your admin account for the first time:

1. Go to **http://localhost:5173/account**
2. Click **Create one** and register with any email and password
3. Open your browser's **developer tools** → **Application** → **Local Storage** → `http://localhost:5173`
4. Find the key `pb_session` and edit the JSON so `"isAdmin": true`
5. Reload the page

From that point your account is treated as admin in local mode. Go to `/admin` and sign in with the same credentials.

> **Note:** This is development only. On the live Firebase-connected site, admin access is set properly in the Firebase console — see [section 8](#8-connecting-firebase-going-live).

### Once Firebase is connected (live site)

1. Go to `https://yoursite.co.uk/admin`
2. Sign in with the email and password you set up in Firebase Authentication
3. You will be redirected to the dashboard automatically

If you see the login screen again after signing in, your account has not been granted admin access in Firestore yet. See [section 8](#8-connecting-firebase-going-live) for how to do this.

---

## 3. The dashboard

The dashboard gives you an at-a-glance overview of the business.

| Card | What it shows |
|---|---|
| **Total orders** | Every order ever placed |
| **New orders** | Orders waiting for your confirmation — action required |
| **Revenue** | Sum of all non-cancelled orders |
| **Low stock** | Products with 3 or fewer units remaining |

Below the cards is a **Recent orders** table showing the last 8 orders with customer name, date, total and status. Click **View all** to open the full orders page.

---

## 4. Managing orders

Go to **Admin → Orders** (`/admin/orders`).

### Reading the table

Each row shows:

- **Ref** — a short reference (last 6 characters of the order ID, e.g. `#A3F91C`)
- **Customer** — the name entered at checkout
- **Email** — the customer's email address
- **Date** — when the order was placed
- **Total** — the order value
- **Status** — where the order is in the workflow

### Order statuses

| Status | Meaning |
|---|---|
| **New** | Just placed — needs your attention |
| **Confirmed** | You have accepted and confirmed it with the customer |
| **In production** | The cake is being baked and decorated |
| **Ready** | The cake is finished and ready for collection or delivery |
| **Completed** | Collected or delivered — order done |
| **Cancelled** | Cancelled by you or the customer |

### Viewing order details

Click anywhere on a row to expand it. You will see:

- Every item ordered, quantity and line total
- Customer contact details (email, phone)
- Event date
- Delivery or collection preference
- Preferred flavour
- Any design notes left by the customer

### Searching and filtering

- Use the **search box** to find by customer name, email, or order reference
- Use the **status buttons** to filter by stage (e.g. show only New orders)

---

## 5. Fulfilling an order — step by step

This is the typical flow from a new order to a completed one.

---

### Step 1 — Order comes in (Status: New)

You receive a new order. The **New** count on the dashboard increases.

**Action:**
1. Go to **Admin → Orders**
2. Find the order (filter by **New** to see only fresh orders)
3. Expand the row and review: customer details, items, event date, flavour, and any notes

---

### Step 2 — Confirm with the customer (Status: Confirmed)

Before you begin baking, contact the customer to confirm:
- The event date is correct
- The flavour choice is final
- Any design adjustments have been agreed
- Collection or delivery logistics are clear

**Once agreed:**
1. Expand the order row
2. In the **Update status** section at the bottom, click **→ Confirmed**
3. The status badge updates immediately

> The customer can track their order status in their account at `/account`.

---

### Step 3 — Begin baking (Status: In production)

When you start making the cake:

1. Expand the order row
2. Click **→ In production**

This helps you keep track of which cakes are actively being made, especially if you have multiple orders at once.

---

### Step 4 — Cake is finished (Status: Ready)

When the cake is fully made and decorated:

1. Click **→ Ready**
2. Contact the customer to arrange collection or confirm delivery time

---

### Step 5 — Collected or delivered (Status: Completed)

Once the customer has received their cake:

1. Click **→ Completed**

This closes the order and it moves out of your active queue.

---

### Cancelling an order

If an order needs to be cancelled at any point:

1. Expand the order row
2. Click **→ Cancelled**

Cancelled orders remain in the system for your records. They are excluded from the revenue total on the dashboard.

> Stock is decremented when an order is placed. If you cancel an order, remember to manually increase the stock count for those products in **Inventory** (see section 6).

---

## 6. Managing inventory

Go to **Admin → Inventory** (`/admin/inventory`).

The table shows every product in the store with its current price, stock level, and visibility status.

### Editing price or stock

1. Find the product you want to update
2. Click **Edit**
3. Change the price (in £) or the stock number
4. Click **Save**

Changes take effect immediately — the store updates at the next page load.

### Stock level indicators

| Colour | Meaning |
|---|---|
| Normal text | Stock is healthy |
| **Amber** with ⚠ icon | 3 or fewer remaining — consider baking more |
| **Red** | Out of stock — shown as "Sold out" on the store card |

### Hiding a product

If you want to temporarily remove a cake from the store (e.g. while you are away, or a design is being updated):

1. Click the **eye icon** on the product row
2. The product disappears from the customer-facing store immediately
3. Click the icon again to make it visible again

Hidden products are not deleted — they sit in the inventory as **Hidden** and can be re-activated at any time.

---

## 7. How the store works (customer journey)

Understanding what your customers see helps you set the right expectations.

### Browsing (`/store`)
Customers see all active, in-stock products. They can filter by occasion (Birthday, Wedding, Celebration) and sort by name or price.

### Adding to basket
Clicking **Add to basket** opens a slide-in drawer showing everything in their cart. They can increase or decrease quantities, remove items, or go straight to checkout.

### Checkout (`/checkout`)
Customers enter:
- Name, email, phone
- Event date
- Collection or delivery preference
- Flavour choice
- Any design notes

No payment is taken at checkout — this is a pre-order / enquiry system. You confirm price and payment directly with each customer.

### Order placed
Stock is immediately decremented when an order is placed. The customer sees a confirmation screen with their order reference, and the order appears in your admin panel as **New**.

### Tracking (`/account`)
Signed-in customers can see all their orders and their current status in their account page.

---

## 8. Connecting Firebase (going live)

Right now the site stores everything in your browser's local storage. To use a real database that works across devices and browsers, connect Firebase.

### Quick steps

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Start in production mode
4. Copy your project config and paste it into `src/config/firebase.js`
5. Set your email in `ADMIN_EMAILS` in the same file
6. Deploy the security rules: `firebase deploy --only firestore:rules`
7. In Firebase Authentication, add yourself as a user
8. In Firestore, create `admins → {your-uid}` with field `isAdmin: true`

Full step-by-step instructions are in **`FIREBASE_SETUP.md`** in the project root.

### What changes when Firebase is connected

- Orders are stored in the cloud, visible from any device
- Customer accounts work across browsers and devices
- Stock changes in the admin panel reflect immediately on the live store
- Your admin password is managed securely by Firebase Authentication

---

## 9. Before launch checklist

Work through this before making the site public.

### Business details
- [ ] Replace placeholder email in `src/data/site.js`
- [ ] Add real phone number (if sharing publicly)
- [ ] Confirm service area and update `serviceArea` in `src/data/site.js`
- [ ] Replace social media handles with your real accounts
- [ ] Update `site.url` to your live domain

### Content
- [ ] Replace sample cake designs with your real cakes (update `src/data/cakes.js`)
- [ ] Add real photography — drop images into `src/assets/` and set the `src` prop on each cake's `OptimizedImage`
- [ ] Confirm collection names and descriptions
- [ ] Replace sample testimonials with genuine customer feedback
- [ ] Write your real founder story on the **Our Story** page
- [ ] Finalise the privacy policy at `/privacy`
- [ ] Review journal articles before publishing

### Store
- [ ] Confirm prices in `src/data/cakes.js` (currently placeholders)
- [ ] Confirm stock levels
- [ ] Connect a form/payment service or clarify payment flow to customers
- [ ] Connect Firebase (see section 8)

### SEO
- [ ] Update `robots.txt` with your real domain
- [ ] Replace `og-image.svg` with a 1200×630 PNG photo
- [ ] Test that all pages have correct titles and descriptions

### Admin
- [ ] Test the full order flow end-to-end on the live site
- [ ] Confirm you can log in to the admin panel
- [ ] Confirm status updates reflect in customer accounts

---

*Guide version 1.0 — Purple Bee Cakes*
