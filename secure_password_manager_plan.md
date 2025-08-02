# 📘 SecurePassVault: Full Project Plan

A **secure, full-fledged password manager website** with encryption, tagging, and a master password-based login system, deployed on your own Ubuntu server and hosted at:

**🔗 **[**https://passwords.devcrewx.tech**](https://passwords.devcrewx.tech)

---

## 📌 Feature Overview

### 🔐 Core Features

- Master password-based login system
- Add credentials (website, username, password)
- View credentials in a searchable, tag-filtered dashboard
- Copy username and password buttons (clipboard copy)
- Tags for entries (e.g., social, college, banking)
- Edit/Delete individual entries
- Responsive mobile-first design

### 🔒 Security Features

- AES-256 encryption for password fields
- Key derived from master password using PBKDF2
- Master password never stored (only hash stored using bcrypt)
- JWT-based secure session authentication
- HTTPS-only communication
- XSS, CSRF, and input sanitization protections
- Clipboard auto-clear after a timeout (optional)

---

## 🧰 Tech Stack

| Layer      | Technology                      |
| ---------- | ------------------------------- |
| Frontend   | React.js + Tailwind CSS         |
| Backend    | Node.js + Express.js            |
| Database   | MongoDB (self-hosted on Ubuntu) |
| Encryption | Node.js crypto (AES-256-GCM)    |
| Auth       | JWT + bcrypt                    |
| Deployment | Ubuntu Server + Nginx + PM2     |

---

## 📁 Database Schema

### 🔸 `users` Collection

```js
{
  _id,
  email,
  masterPasswordHash, // bcrypt hashed
  createdAt
}
```

### 🔸 `credentials` Collection

```js
{
  _id,
  userId,               // Reference to users
  website: String,
  username: String,
  passwordEncrypted: String,  // AES-encrypted
  iv: String,                 // Initialization vector for AES
  tags: ["college", "social"], // Optional user-defined tags
  createdAt,
  updatedAt
}
```

---

## 🧱 Folder Structure

```bash
securepassvault/
├── client/                   # React frontend
│   ├── src/components/       # CredentialCard, Navbar, Modal
│   ├── src/pages/            # LoginPage, Dashboard
│   ├── src/hooks/            # useClipboard, useAuth
│   ├── src/utils/            # crypto.js, helpers.js
├── server/                   # Express backend
│   ├── routes/               # auth.js, credentials.js
│   ├── controllers/          # authController.js
│   ├── models/               # User.js, Credential.js
│   ├── utils/                # cryptoUtils.js
│   └── middleware/           # authMiddleware.js
```

---

## 🧑‍💻 Development Plan

### 🟩 Phase 1: Project Setup

- Initialize Git repo with `client/` and `server/`
- Install dependencies for both (React, Express, MongoDB, Tailwind)
- Setup environment configuration with `.env`

### 🟩 Phase 2: Authentication

- Signup/Login APIs
- Store only bcrypt-hashed master password
- JWT-based auth with httpOnly cookies
- React login form UI with auth context hook

### 🟩 Phase 3: Credential Storage + Encryption

- Derive AES encryption key from entered master password (PBKDF2)
- Encrypt credentials before sending to server
- Store IV and encrypted data in MongoDB
- Decrypt on frontend after fetching

### 🟩 Phase 4: Tags & Filtering

- Allow user to add tags when creating/editing credentials
- Add tag filters and search box in UI
- Tags stored as string arrays per credential

### 🟩 Phase 5: Clipboard Copy Buttons

- Copy username/password to clipboard with `navigator.clipboard.writeText()`
- Add toast for confirmation: "Copied!"
- Optional auto-clear from clipboard after timeout (via JS timer)

### 🟩 Phase 6: UI and UX

- Build dashboard layout using Tailwind grid
- Mobile-first responsive design
- Modal for Add/Edit Credential
- Search and tag filtering UI

---

## 🧪 Testing Plan

- Manual flow tests (login, create, edit, delete, logout)
- Unit tests for encryption/decryption (Node.js crypto)
- API tests with Postman/Jest
- UI tests (React Testing Library, Cypress optional)

---

## 🚀 Deployment Plan (Ubuntu Server)

### 🔹 Server Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx mongodb git curl nodejs npm -y
```

### 🔹 MongoDB (Self-Hosted)

```bash
sudo systemctl enable mongodb
sudo systemctl start mongodb
```

No sign-up or API key needed.

### 🔹 Backend Setup

```bash
cd /var/www/securepassvault-api
git clone https://github.com/your-repo/securepassvault-api.git
npm install
```

`.env` example:

```env
PORT=4000
JWT_SECRET=your-super-secret
DB_URI=mongodb://localhost:27017/securepassvault
```

Use PM2 to keep backend alive:

```bash
sudo npm install -g pm2
pm2 start index.js --name securepassvault-api
pm2 save
```

### 🔹 Frontend Setup

```bash
cd /var/www/securepassvault-client
npm install
npm run build
```

### 🔹 Nginx Config (`/etc/nginx/sites-available/securepassvault`)

```nginx
server {
    listen 80;
    server_name passwords.devcrewx.tech;

    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/securepassvault-client;
        index index.html index.htm;
        try_files $uri /index.html;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/securepassvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 🔹 HTTPS with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d passwords.devcrewx.tech
```

Auto-renewal:

```cron
0 0 * * * certbot renew --quiet
```

### 🔹 UFW Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔐 Optional: Daily Backups

```bash
mkdir -p /var/backups/securepassvault
crontab -e
```

Add:

```bash
0 2 * * * mongodump --out /var/backups/securepassvault/$(date +\%F)
```

---

## ✅ Summary

You will build a secure password manager with local encryption, tagging, login authentication, responsive UI, and self-hosted infrastructure — fully under your control.

**Hosted at:** `https://passwords.devcrewx.tech`

Note: Now i am building this project in my local laptop and then i will scp the whole project folder to the server. keep this mind while developing the website.

