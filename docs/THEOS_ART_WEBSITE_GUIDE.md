# Theos Art Website — Features & How to Use

Simple guide for the Theos Art Hub website. Share this with your team.

**Public site:** your live Vercel URL (e.g. theosart.com)  
**Admin:** `/auth/login` → Admin account → Admin dashboard

---

## 1. What visitors see

| Page | Purpose |
|------|---------|
| **Home** | Brand, shop teaser, workshops/services, Art Events, Announcements |
| **Shop** | Buy artworks and art materials (cart + MTN MoMo) |
| **Art Gallery** | Photos, studio projects, books, culture (English / Kinyarwanda) |
| **E-learning** | Hub for **Trainings** and **Internship** |
| **Trainings** | Beginner visual art training story + open programmes to enroll |
| **Internship** | Studio internship programmes |
| **About** | Company story and contact |
| **Login** | Student, Artist, Instructor, or Admin |

Header navigation: **Home · Shop · Art Gallery · E-learning · About** (+ Login).  
Trainings and Internships are opened from the E-learning page (not listed in the header).

---

## 2. How students enroll (E-learning)

1. Open **E-learning** → **View trainings** (or Internship).
2. Read the programme details.
3. Click **Enroll** (login is asked only at this step if they are not signed in).
4. Create a **Student** account (or sign in).
5. Pay via **MTN MoMo** if the programme is paid, then upload the receipt when asked.
6. After admin approval (for paid programmes), lessons appear in the **Student portal**.

**Tagline on Trainings:** *Learn. Create. Inspire.*

---

## 3. Admin — day-to-day publishing

Sign in as **Admin**, then use the left menu.

### Shop products
**Admin → Products**

1. Ensure a **shop category** exists (**Categories** → type Shop).
2. **Add product**: name, category, price, stock, image, status **Published**.
3. **Sold as:** Per piece, Pack, or Set/box — and set pieces per pack when needed.
4. Use **Preview / Edit / Delete** on each product card.

Published products appear on **Shop**.

### Trainings & Internship programmes
**Admin → Programs**

1. **Create program** (or use seed defaults).
2. Choose type: **Workshop / Studio programme** (training) or **Internship / Creative residency**.
3. Set **Duration** (e.g. `3 months`, `6 months`, `Weekend evenings`).
4. Set price (0 = free) and assign an **Instructor** if ready.
5. Status **Published**.
6. Open the programme → add **lessons** / materials.

They then appear on **Trainings** or **Internship** for enrollment.

### Home — Art Events & news
**Admin → Art Events & news**

- **Art Events** tab → date, location, image → **Published** → shows on Home.
- **Announcements** tab → message + image → **Published** → shows on Home.

### Art Gallery items
**Admin → Art Gallery** (library)

1. Pillar **Gallery**.
2. Type: **Photos & events** or **Studio project**.
3. Upload **several pictures** at once.
4. Publish.

### Homepage services (workshop cards)
**Admin → Services** → create/publish cards for the Home “Workshops & creative learning” section.

### Site look & contacts
**Admin → Site & branding** — logo, about text, SEO, company contacts.

### Security
**Admin → Security** — change your admin password (enter current password first); optional 2FA.

---

## 4. Instructor & Artist (roles)

| Role | Login choice | Where they work |
|------|----------------|-----------------|
| **Student** | Student | Student portal — enroll, lessons, certificates |
| **Instructor** | Instructor (lecturer) | Lecturer portal — deliver assigned programmes |
| **Artist** | Artist | Engineer-style portal (studio tools / subscriptions if enabled) |
| **Admin** | Admin | Full dashboard |

Instructors must be **approved** by Admin before they can sign in to deliver courses.

---

## 5. Payments (MoMo)

- Pay Code / merchant details are on **Payment Instructions** and at checkout.
- Customers upload a receipt; Admin approves under **Payments** / enrollments.
- Free programmes skip payment approval.

---

## 6. Media (R2 images & files)

Product, gallery, and course images can be stored on **Cloudflare R2** when Vercel env vars are set (`R2_*`, `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`).  
Setup steps: `scripts/43-r2-setup.md`.

---

## 7. Suggested content workflow

1. Create shop **categories** → add **products** with clear “Sold as” packaging.
2. Publish at least one **Training** programme with duration and lessons.
3. Add an **Art Event** and one **Announcement** for the homepage.
4. Add a **Gallery** album with multiple photos.
5. Test: guest → Trainings → Enroll → Student login → enrollment flow.

---

## 8. Support contacts (on the site)

Use the contacts configured in Admin → Site & branding (email, phone, address).  
Default brand contacts are listed in the website footer.

---

*Document for Theos Art Ltd — website operations overview.*
