# Install Metrics Management

How to install some metrics management in our app/virtual machine

## Install Prometheus
1. Download prometheus from here
```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.51.1/prometheus-2.51.1.linux-amd64.tar.gz
```
2. Download node exporter
```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
```
3. Create user and group for prometheus
```bash
sudo groupadd --system prometheus
sudo useradd --system -s /sbin/nologin -g prometheus prometheus
```
4. Untar the .tar.gz file
```bash
tar -xvf prometheus-2.51.1.linux-amd64.tar.gz
tar -xvf node_exporter-1.7.0.linux-amd64.tar.gz
```
5. Move prometheus and promtool from prometheus folder to bin folder
```bash
sudo mv prometheus-2.51.1.linux-amd64/prometheus prometheus-2.51.1.linux-amd64/promtool /usr/local/bin/
```
6. Check prometheus
```bash
prometheus --version
```
7. Create folder for prometheus config and library store
```bash
sudo mkdir /etc/prometheus && sudo mkdir /var/lib/prometheus
```
8. Change ownership of prometheus library store to user and group prometheus
```bash
sudo chown -R prometheus:prometheus /var/lib/prometheus/
```
9. Move all prometheus config to prometheus folder
```bash
sudo mv consoles/ console_libraries/ prometheus.yml /etc/prometheus/
```
10. Create prometheus systemctl service file
```bash
sudo vim /etc/systemd/system/prometheus.service
```
```config
[Unit]
Description=Prometheus
Documentation=https://prometheus.io/docs/introduction/overview
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
--config.file /etc/prometheus/prometheus.yml \
--storage.tsdb.path /var/lib/prometheus \
--web.console.templates=/etc/prometheus/consoles \
--web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```
11. Reload the daemon
```bash
sudo systemctl daemon-reload
```
12. Start prometheus service
```bash
sudo systemctl enable --now prometheus.service
```
13. Move node-exporter to bin folder
```bash
sudo mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/ 
```
14. Create node-exporter systemctl service file
```bash
sudo vim /etc/systemd/system/node-exporter.service
```
```config
[Unit]
Description=Prometheus exporter for machine metrics

[Service]
Restart=always
User=prometheus
ExecStart=/usr/local/bin/node_exporter
ExecReload=/bin/kill -HUP $MAINPID
TimeoutStopSec=20s
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
```
15. Reload the daemon and start node-exporter service
```bash
sudo systemctl daemon-reload && sudo systemctl enable --now node-exporter.service
```
16. Adjust prometheus.yml file
```bash
sudo vim /etc/prometheus/prometheus.yml
```
```yaml
global:
   scrape_interval: 15s
   evaluation_interval: 15s
alerting:
   alertmanagers:
      - static_configs:
         - targets:
rule_files:
scrape_configs:
   - job_name: "prometheus"
      static_configs:
         - targets: ["localhost:9090"]
   - job_name: "node-exporter"
      static_configs:
         - targets: ["localhost:9100"]
```
17. Restart prometheus service
```bash
sudo systemctl restart prometheus.service
```

## Install Grafana
1. Install the prerequisite packages
```bash
sudo apt-get install -y apt-transport-https software-properties-common wget
```
2. Import GPG Key
```bash
sudo mkdir -p /etc/apt/keyrings/
```
```bash
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
```
3. Add a repository for stable releases
```bash
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
```
4. Update the package
```bash
sudo apt-get update
```
5. Install grafana
```bash
sudo apt-get install grafana
```
6. Start grafana-server service
```bash
sudo systemctl enable --now grafana-server.service
```
7. Check grafana in `http://localhost:3000`\
Init Username: admin\
Password: admin