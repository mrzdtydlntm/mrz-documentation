# SSL Certificate Assignment
## Cert App using Certbot and NGINX
1. Install Certbot and NGINX
```bash
sudo apt install certbot nginx -y
```
2. Add well known configuration in NGINX
```bash
sudo vim /etc/nginx/snippets/well-known.conf
```
```conf
location ^~ /.well-known/acme-challenge/ {
    allow all;
    root /var/www/html/;
    default_type "text/plain";
    try_files $uri =404;
}
```
3. Add well-known.conf to nginx conf
```bash
sudo vim /etc/nginx/sites-available/<your_conf_file>
```
```conf
location ~ /.well-known {
    allow all;
}
```
4. Add include snippets inside your web conf
```bash
sudo vim /etc/nginx/sites-available/<your_conf>
```
```conf
server {
    listen 80;
    server_name _;
    include snippets/well-known.conf;
    ...
}
```
5. Symlink the configuration file from `/sites-available` folder to `/sites-enabled` folder
```bash
sudo ln -s /etc/nginx/sites-available/<your_conf> /etc/nginx/sites-enabled/<your_conf>
```
6. Test the NGINX configuration
```bash
nginx -t
```
If the configuration test passed, you can restart the NGINX
```bash
nginx -s reload
```
7. Cert your domain
```bash
sudo certbot certonly --agree-tos --email <your_email> --webroot -w /var/www/html -d <your_domain> -d www.<your_domain>
```
8. Add SSL Certificate and change your port conf
```bash
sudo vim /etc/nginx/sites-available/<your_conf>
```
```conf
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/letsencrypt/live/<your_domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<your_domain>/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/<your_domain>/chain.pem;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ...
}
```
9. Restart NGINX
```bash
nginx -s reload
```
10. Add cronjob every 87 days to renew new certificates
```bash
crontab -e
```
and then you can see the inside of crontab file. You can add the last line on your crontab file.
```crontab
GNU nano 6.2                                                                                     
# Edit this file to introduce tasks to be run by cron.
# 
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run
# and what command to run for the task
# 
# To define the time you can provide concrete values for
# minute (m), hour (h), day of month (dom), month (mon),
# and day of week (dow) or use '*' in these fields (for 'any').
# 
# Notice that tasks will be started based on the cron's system
# daemon's notion of time and timezones.
# 
# Output of the crontab jobs (including errors) is sent through
# email to the user the crontab file belongs to (unless redirected).
# 
# For example, you can run a backup of all your user accounts
# at 5 a.m every week with:
# 0 5 * * 1 tar -zcf /var/backups/home.tgz /home/
# 
# For more information see the manual pages of crontab(5) and cron(8)
# 
# m h  dom mon dow   command

# ADD THIS
0 0 17 1 */4 /usr/bin/certbot renew && /usr/sbin/nginx -s reload
```