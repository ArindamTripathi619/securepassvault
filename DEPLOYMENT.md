# 🚀 SecurePassVault Deployment Guide

This guide covers the complete deployment process for SecurePassVault from local development to production server.

## 📦 Pre-Deployment: Creating Archive

### Step 1: Prepare Project for Deployment

First, ensure your project is ready for deployment by cleaning up development files:

```bash
# Navigate to project directory
cd /home/DevCrewX/Projects/securepassvault

# Clean node_modules (will be reinstalled on server)
rm -rf client/node_modules server/node_modules

# Clean build artifacts
rm -rf client/build

# Remove development logs and temporary files
rm -f server/server.log server/nohup.out
rm -f server/cookies.txt server/test_cookies.txt
```

### Step 2: Create Production Archive

```bash
# Create archive excluding unnecessary files
cd /home/DevCrewX/Projects
tar -czf securepassvault-production.tar.gz \
  --exclude='*/node_modules' \
  --exclude='*/build' \
  --exclude='*/.git' \
  --exclude='*/server.log' \
  --exclude='*/nohup.out' \
  --exclude='*/*.log' \
  --exclude='*/cookies.txt' \
  securepassvault/

# Verify archive size
ls -lh securepassvault-production.tar.gz
```

### Step 3: Transfer to Server

```bash
# Replace with your server details
SERVER_USER="your_username"
SERVER_IP="your_server_ip"
SERVER_PATH="/var/www"

# Transfer archive to server
scp securepassvault-production.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# SSH into server and extract
ssh $SERVER_USER@$SERVER_IP "
  cd /tmp && 
  sudo tar -xzf securepassvault-production.tar.gz -C $SERVER_PATH && 
  sudo chown -R $SERVER_USER:$SERVER_USER $SERVER_PATH/securepassvault
"
```

---

## 🖥️ Server Setup & Deployment

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Domain name pointed to your server IP (passwords.devcrewx.tech)
- Root or sudo access

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx ufw

# Install Node.js (using NodeSource repository for latest version)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version
npm --version
nginx -v
```

### Step 2: MongoDB Installation

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Step 3: Project Setup

Navigate to the extracted project directory and run the setup script:

```bash
cd /var/www/securepassvault
chmod +x setup.sh
sudo ./setup.sh
```

### Step 4: Nginx Configuration

The setup script will create the Nginx configuration, but here's the manual process:

```bash
# Create Nginx site configuration
sudo tee /etc/nginx/sites-available/securepassvault > /dev/null <<EOF
server {
    listen 80;
    server_name passwords.devcrewx.tech;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # API routes
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location / {
        root /var/www/securepassvault/client/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.env$ {
        deny all;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/securepassvault /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d passwords.devcrewx.tech

# Verify auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron job
echo "0 2 * * * certbot renew --quiet" | sudo tee -a /etc/crontab
```

### Step 6: Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Check firewall status
sudo ufw status
```

### Step 7: Process Management with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
cd /var/www/securepassvault/server
pm2 start index.js --name "securepassvault-api"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown by the command above

# Check PM2 status
pm2 status
pm2 logs securepassvault-api
```

---

## 🔧 Production Configuration

### Environment Variables

Update the server environment file:

```bash
# Edit server/.env
PORT=4000
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
DB_URI=mongodb://localhost:27017/securepassvault
NODE_ENV=production
COOKIE_DOMAIN=passwords.devcrewx.tech
```

### MongoDB Security (Optional but Recommended)

```bash
# Create MongoDB admin user
mongosh <<EOF
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-mongodb-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
EOF

# Enable authentication in MongoDB config
sudo sed -i 's/#security:/security:\n  authorization: enabled/' /etc/mongod.conf
sudo systemctl restart mongod

# Update connection string in .env
DB_URI=mongodb://admin:your-secure-mongodb-password@localhost:27017/securepassvault?authSource=admin
```

---

## 🔍 Post-Deployment Verification

### Step 1: Check All Services

```bash
# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx

# Check PM2 process
pm2 status

# Check logs
pm2 logs securepassvault-api --lines 50
sudo tail -f /var/log/nginx/error.log
```

### Step 2: Test API Endpoints

```bash
# Test health endpoint
curl https://passwords.devcrewx.tech/api/health

# Test signup (replace with your test data)
curl -X POST https://passwords.devcrewx.tech/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "masterPassword": "testpass123"}'
```

### Step 3: Access Website

Visit `https://passwords.devcrewx.tech` in your browser and verify:
- ✅ HTTPS is working (green lock icon)
- ✅ Website loads correctly
- ✅ Can register a new account
- ✅ Can login with created account
- ✅ Can add, view, edit, and delete credentials
- ✅ Copy to clipboard functionality works
- ✅ Search and tag filtering works

---

## 🔄 Maintenance & Updates

### Updating the Application

```bash
# Create new archive on local machine
tar -czf securepassvault-update.tar.gz --exclude='*/node_modules' securepassvault/

# Transfer to server
scp securepassvault-update.tar.gz user@server:/tmp/

# On server:
cd /var/www
sudo cp -r securepassvault securepassvault-backup-$(date +%Y%m%d)
pm2 stop securepassvault-api
sudo tar -xzf /tmp/securepassvault-update.tar.gz
cd securepassvault/server && npm install
cd ../client && npm install && npm run build
pm2 start securepassvault-api
```

### Database Backup

```bash
# Create backup script
sudo tee /etc/cron.daily/mongodb-backup > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/securepassvault"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR
mongodump --out \$BACKUP_DIR/\$DATE
tar -czf \$BACKUP_DIR/mongodb-backup-\$DATE.tar.gz -C \$BACKUP_DIR \$DATE
rm -rf \$BACKUP_DIR/\$DATE

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "mongodb-backup-*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /etc/cron.daily/mongodb-backup
```

### Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check PM2 processes
pm2 monit

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🆘 Troubleshooting

### Common Issues

1. **502 Bad Gateway**: PM2 process is down
   ```bash
   pm2 restart securepassvault-api
   ```

2. **MongoDB Connection Error**: Check MongoDB status
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **SSL Certificate Issues**: Renew certificate
   ```bash
   sudo certbot renew
   ```

4. **Permission Issues**: Fix ownership
   ```bash
   sudo chown -R www-data:www-data /var/www/securepassvault
   ```

### Log Locations

- Nginx Error Log: `/var/log/nginx/error.log`
- Nginx Access Log: `/var/log/nginx/access.log`
- PM2 Logs: `pm2 logs securepassvault-api`
- MongoDB Log: `/var/log/mongodb/mongod.log`

---

## 🎉 Success!

Your SecurePassVault application should now be live at `https://passwords.devcrewx.tech`!

For any issues, check the troubleshooting section or review the service logs.
