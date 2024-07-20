# Deploy on Virtual Machine

How to deploy some tech stack in virtual machine

## Deploy Laravel
1. Get in into root user
```bash
sudo su
```
2. Update the ubuntu repository
```bash
sudo apt update -y
```
3. Install NGINX Proxy
```bash
sudo apt install nginx -y
```
4. Add Ondrej PPA Repository
```bash
sudo add-apt-repository ppa:ondrej/php
```
5. Do the repository update again
```bash
sudo apt update
```
6. Install PHP8.2
```bash
sudo apt install php8.2 -y
```
7. Install PHP module
```bash
sudo apt install php8.2-{fpm,imap,ldap,xml,curl,mbstring,zip,mongodb,gd,dev}
```
8. Remove Apache2 from the systemctl (because it will conflicted with NGINX)
```bash
sudo systemctl stop apache2
sudo systemctl disable apache2
```
9. Install Composer
```bash
wget -O composer-setup.php https://getcomposer.org/installer
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
```
10. Clone the repository in `/var/www` folder
```bash
cd /var/www
git clone https://gitlab.com/user/laravel-repo.git
```
11. Install the vendor package
```bash
composer install
```
12. Copy the .env.example into .env file and fill the .env file
```bash
cp .env.example .env
```
13. Do the artisan things
```bash
php artisan jwt:secret
```
```bash
php artisan key:generate
```
14. Seed database
```bash
php artisan db:seed
```
15. Create file inside /etc/nginx/sites-available
```bash
vim /etc/nginx/sites-available/laravel-repo
```
Fill it with this value:
```config
server {
	listen 80;
	index index.php index.html index.htm;
	error_log  /var/log/nginx/backend-error.log;
	access_log /var/log/nginx/backend-access.log;
	root /var/www/laravel-repo/public;

	location / {
    	try_files $uri $uri/ /index.php?$query_string;
    	gzip_static on;
	}

	location ~ \.php$ {
    	include snippets/fastcgi-php.conf;
    	fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    	fastcgi_split_path_info ^(.+\.php)(/.+)$;
    	include fastcgi_params;
    	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    	fastcgi_param PATH_INFO $fastcgi_path_info;
	}

	location ~ /.well-known {
    	allow all;
	}

	location = /.env {
    	deny all;
    	return 404;
	}
}
```
16. Symlink it into /etc/nginx/sites-enabled
```bash
ln -s /etc/nginx/sites-available/laravel-repo /etc/nginx/sites-enabled/laravel-repo
```
17. Unlink default file inside sites-enabled folder
```bash
unlink /etc/nginx/sites-enabled/default
```
18. Test the nginx configuration
```bash
nginx -t
```
19. Reload the nginx
```bash
nginx -s reload
```

## Deploy Wordpress MySQL and NGINX
1. Install common software
```bash
sudo apt-get update
sudo apt -y install software-properties-common
```
2. Install NGINX
```bash
sudo apt install nginx -y
```
3. Add PHP Repository
```bash
sudo add-apt-repository ppa:ondrej/php
```
4. Install PHP and basic extension
```bash
sudo apt install php8.2 php8.2-fpm php8.2-common php8.2-gmp php8.2-curl php8.2-intl php8.2-mbstring php8.2-xmlrpc php8.2-gd php8.2-xml php8.2-cli php8.2-zip php8.2-mysql
```
5. Purge Apache Web Server
```bash
sudo apt purge apache2
```
6. Download and unzip wordpress latest
```bash
wget https://wordpress.org/latest.tar.gz
tar -xvzf latest.tar.gz
```
7. Move to NGINX folder
```bash
sudo mv wordpress /var/www && cd /var/www/<folder-name>
```
8. Install MySQL or MariaDB
```bash
sudo apt install mariadb-server # MariaDB
sudo apt install mysql-server # MySQL
```
9. Secure install MySQL
```bash
mysql_secure_installation
```
10. Create wordpress database
```bash
mysql -u root
```
```sql
CREATE DATABASE <db-name>;
CREATE USER '<user-name>'@'localhost' IDENTIFIED BY '<password>';
GRANT ALL ON <db-name>.* TO '<user-name>'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```
11. Configure `wp-config.php`
```bash
sudo cp wp-config-sample.php wp-config.php
sudo vim wp-config.php
```
12. Change owner wordpress folder
```bash
sudo chown -R www-data:www-data /var/www/<folder-name>
```
13. Change mode wordpress folder
```bash
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;
```

## Deploy NodeJS using Node Version Manager (NVM)
1. Curl installation shell from github
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
2. Source the changed data in bash
```bash
source ~/.bashrc
```
3. Check node version in terminal
```bash
nvm list-remote
```
4. Install required node version
```bash
nvm install <node_version>
```
For example:
```bash
nvm install v16.13.0
```
5. Check your node inside terminal
```bash
node -v
```
6. Install package manager

If you use pnpm:
```bash
npm i -g pnpm
```
If you use yarn:
```bash
npm i -g yarn
```
7. Install NGINX Proxy
```bash
sudo apt install nginx -y
```
8. Use SuperUser to access root folder
```bash
sudo su
```
9. Go to destination folder for your repository, and clone it
```bash
cd /var/www
git clone https://gitlab.com/user/node-repo.git
cd node-repo
```
10. Install node_modules
```bash
pnpm install
```
11. Build the code
```bash
pnpm run build
```
### Static File
12. Create file inside /etc/nginx/sites-available
```bash
vim /etc/nginx/sites-available/node-static-conf
```
Fill it with this value:
```config
server {
    listen 80;
    root /var/www/node-repo/dist; # Build code static files are often found in the dist folder.
    index index.html;

    location / {
        try_files $uri $uri/ @rewrites;
        include  /etc/nginx/mime.types;

        proxy_set_header Host $host;
        proxy_set_header Referer $http_referer;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location @rewrites {
        rewrite ^(.+)$ /index.html last;
    }

	location = /.env {
        deny all;
        return 404;
    }
}
```
13. Symlink it into /etc/nginx/sites-enabled
```bash
ln -s /etc/nginx/sites-available/node-static-conf /etc/nginx/sites-enabled/node-static-conf
```
14. Unlink default file inside sites-enabled folder
```bash
unlink /etc/nginx/sites-enabled/default
```
15. Test the nginx configuration
```bash
nginx -t
```
16. Reload the nginx
```bash
nginx -s reload
```
### Upstream Port
12. Install pm2 to run the app in background
```bash
npm i -g pm2
```
13. Run the app using pm2
```bash
PORT=3000 NODE_PORT=3000 pm2 start pnpm --name "node-upstream:3000" -- start
```
14. Check the app if it's already running
```bash
curl -X GET -I http://127.0.0.1:3000
```
The stdout should print this:
```stdout
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: text/html
Cache-Control: no-cache
Etag: W/"63f-nngLMxQfvLPukzBwkH36P2K460M"
Date: Mon, 24 Jun 2024 15:52:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 1599
```
15. Create file inside /etc/nginx/sites-available
```bash
vim /etc/nginx/sites-available/node-upstream
```
Fill it with this value:
```config
upstream node-upstream {
    server 127.0.0.1:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://node-upstream;
        proxy_set_header Host $host;
        proxy_set_header Referer $http_referer;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /.env {
        deny all;
        return 404;
    }
}
```
16. Symlink it into /etc/nginx/sites-enabled
```bash
ln -s /etc/nginx/sites-available/node-upstream /etc/nginx/sites-enabled/node-upstream
```
17. Unlink default file inside sites-enabled folder
```bash
unlink /etc/nginx/sites-enabled/default
```
18. Test the nginx configuration
```bash
nginx -t
```
19. Reload the nginx
```bash
nginx -s reload
```

## Deploy Golang using goenv
1. Check out goenv where you want it installed. Usually it's in `$HOME/.goenv`
```bash
git clone https://github.com/go-nv/goenv.git ~/.goenv
```
2. Define environment variable `GOENV_ROOT` to point to the path where goenv repo is cloned and add `$GOENV_ROOT/bin` to your `$PATH` for access to the goenv command-line utility
```bash
echo 'export GOENV_ROOT="$HOME/.goenv"' >> ~/.bashrc
echo 'export PATH="$GOENV_ROOT/bin:$PATH"' >> ~/.bashrc
```
3. Add ``goenv init`` to your shell to enable shims, management of `GOPATH` and `GOROOT` and auto-completion. Please make sure `eval "$(goenv init -)"` is placed toward the end of the shell configuration file since it manipulates `PATH` during the initialization
```bash
echo 'eval "$(goenv init -)"' >> ~/.bashrc
```
4. If you want `goenv` to manage `GOPATH` and `GOROOT` (recommended), add `GOPATH` and `GOROOT` to your shell after `eval "$(goenv init -)"`
```bash
echo 'export PATH="$GOROOT/bin:$PATH"' >> ~/.bashrc
echo 'export PATH="$PATH:$GOPATH/bin"' >> ~/.bashrc
```
5. Restart your shell so the path changes take effect
```bash
exec $SHELL
or
source ~/.bashrc
```
6. Install Go versions into `$GOENV_ROOT/versions`
```bash
goenv install v1.22.2
```
7. Set `goenv` global version
```bash
goenv global v1.22.2
```
8. Install NGINX proxy
```bash
sudo apt install nginx -y
```
9. Use SuperUser to access root folder
```bash
sudo su
```
10. Go to destination folder for your repository, and clone it
```bash
cd /var/www
git clone https://gitlab.com/user/go-repo.git
cd go-repo
```
11. Install go modules
```bash
go mod download && go mod tidy
```
12. Copy the env.example file into .env
```bash
cp .env.example .env
```
13. Build golang app into binary executable file
```bash
go build -o <output-file> <main.go-file-path>
```
Example:
```bash
go build -o app.sh cmd/main.go
```
14. Create file service for running golang app in background
```bash
cd /etc/systemd/system
vim golang-app.service
```
Fill the file with this config:
```config
[Unit]
Description=golang-app

[Service]
Type=simple
User=root
Group=root
LimitNOFILE=1024
Restart=on-failure
RestartSec=10
startLimitIntervalSec=60
WorkingDirectory=/var/www/go-repo
ExecStart=/var/www/go-repo/app.sh

[Install]
WantedBy=multi-user.target
```
15. Restart the daemon and check the service status
```bash
systemctl daemon-reload
systemctl status golang-app.service
```
16. Start the app and enable the service (to make the app autostart)
```bash
systemctl start golang-app.service
systemctl enable golang-app.service
```
15. Check the app if it's already running
```bash
curl -X GET -I http://127.0.0.1:8000
```
The stdout should print this:
```stdout
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: text/html
Cache-Control: no-cache
Etag: W/"63f-nngLMxQfvLPukzBwkH36P2K460M"
Date: Mon, 24 Jun 2024 15:52:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 1599
```
16. Create file inside /etc/nginx/sites-available
```bash
vim /etc/nginx/sites-available/golang-app
```
Fill it with this value:
```config
upstream golang-app {
    server 127.0.0.1:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://golang-app;
        proxy_set_header Host $host;
        proxy_set_header Referer $http_referer;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /.env {
        deny all;
        return 404;
    }
}
```
17. Symlink it into /etc/nginx/sites-enabled
```bash
ln -s /etc/nginx/sites-available/golang-app /etc/nginx/sites-enabled/golang-app
```
18. Unlink default file inside sites-enabled folder
```bash
unlink /etc/nginx/sites-enabled/default
```
19. Test the nginx configuration
```bash
nginx -t
```
20. Reload the nginx
```bash
nginx -s reload
```