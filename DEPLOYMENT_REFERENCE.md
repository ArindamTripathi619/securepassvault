# 🚀 Deployment Quick Reference Card

## Preparing Deployment Archive

1. **Prepare and Archive**
   ```bash
   ./prepare-deployment.sh
   ```

## Transfer to Server

1. **SCP Archive**
   ```bash
   scp securepassvault-production-YYYYMMDD-HHMMSS.tar.gz user@your-server:/tmp/
   ```
2. **Extract and Setup**
   ```bash
   ssh user@your-server "cd /tmp && sudo tar -xzf securepassvault-production-YYYYMMDD-HHMMSS.tar.gz -C /var/www && sudo chown -R $USER:$USER /var/www/securepassvault"
   ```

## On the Server

1. **Setup**
   ```bash
   cd /var/www/securepassvault
   sudo ./setup.sh
   ```
2. **Setup SSL**
   ```bash
   sudo certbot --nginx -d passwords.devcrewx.tech
   ```

---

🚀 **Your SecurePassVault application should be live at** `https://passwords.devcrewx.tech`!

📋 **Remember to verify everything works correctly and secure your environment appropriately.**

