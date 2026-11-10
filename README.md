# 🖥️ PCSTORE — Online PC Store Admin Dashboard

**Kompyuter do‘koni uchun ma’lumotlar bazasini boshqarish tizimi**

🌐 **Live Demo:** [PCSTORE Admin Dashboard](https://simplyamir-pc-store-67cdb1a9156f.herokuapp.com)

**Mirjalol Ahmadjonov | Full-Stack Web Application**

---

## 🇺🇿 O‘zbekcha

### 📌 Loyiha haqida

**PCSTORE** — kompyuter do‘konining mahsulotlari, kategoriyalari, mijozlari, buyurtmalari va to‘lovlarini boshqarish uchun ishlab chiqilgan veb-ilova.

Tizim administrator uchun mo‘ljallangan bo‘lib, ma’lumotlar bazasi bilan ishlash, yozuvlarni boshqarish va statistik ma’lumotlarni ko‘rish imkonini beradi.

### ✨ Imkoniyatlar

- 🔐 Xavfsiz administrator autentifikatsiyasi
- 📦 Mahsulotlar va kategoriyalarni boshqarish
- 👥 Mijozlar ma’lumotlarini boshqarish
- 🛒 Buyurtmalar va to‘lovlar bilan ishlash
- 📊 Statistik panel va SQL view'lar
- ☁️ Bulutdagi MariaDB ma’lumotlar bazasi

### 🛠️ Texnologiyalar

| Qism | Texnologiyalar |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Ma’lumotlar bazasi | MariaDB |
| Hosting | Heroku, JawsDB Maria |
| Versiya nazorati | Git, GitHub |

### 🚀 Lokal ishga tushirish

**1. Kutubxonalarni o‘rnatish**

```bash
npm ci
npm --prefix backend ci
```

**2. Muhit sozlamalari**

`backend/.env` faylida lokal MariaDB ulanishi va administrator hisobini sozlang. Ma’lumotlar bazasi sxemasi oldindan yaratilgan bo‘lishi kerak.

**3. Backendni ishga tushirish**

```bash
cd backend
npm start
```

**4. Frontendni alohida terminalda ishga tushirish**

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:3001`

---

## 🇬🇧 English

### 📌 About the Project

**PCSTORE** is a full-stack web application designed to manage an online computer store's products, categories, customers, orders, and payments.

It provides a protected administration dashboard for managing database records and viewing store statistics.

### ✨ Features

- 🔐 Secure administrator authentication
- 📦 Product and category management
- 👥 Customer management
- 🛒 Order and payment management
- 📊 Dashboard statistics and SQL views
- ☁️ Cloud-hosted MariaDB database

### 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MariaDB |
| Hosting | Heroku, JawsDB Maria |
| Version Control | Git, GitHub |

### 🚀 Local Development

**1. Install dependencies**

```bash
npm ci
npm --prefix backend ci
```

**2. Configure the environment**

Create `backend/.env` with your local MariaDB connection settings and administrator credentials. Ensure the database schema is initialized.

**3. Start the backend**

```bash
cd backend
npm start
```

**4. Start the frontend in a separate terminal**

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:3001`

---

### 🔒 Security

- Password hashing and protected admin sessions
- HTTPS for the deployed website
- TLS-verified connections to the cloud database
- Environment-based configuration for sensitive credentials

**Note:** This is an educational administration project. Access to the dashboard requires administrator credentials.

---

**© 2026 PCSTORE · Mirjalol Ahmadjonov**