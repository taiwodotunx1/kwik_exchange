# Kwik Exchange 

A live currency converter web application powered by the ExchangeRate-API. Built with Flask (Python) on the backend and vanilla HTML, CSS, and JavaScript on the frontend.

---

## Live Demo

- **Demo Video:** [Watch here](#)
- **Deployed URL:** [Coming soon](#)

---

## Features

- **Live currency conversion** — converts as you type, no button needed
- **160+ currencies** supported with country flags
- **Swap button** — instantly flip from/to currencies
- **Searchable dropdowns** — filter currencies by name or code
- **Exchange rates table** — view all rates from your selected base currency
- **Sort and filter** — sort rates by name or value, filter by search
- **Last updated timestamp** — shows when rates were last refreshed
- **Loading screen** — smooth entry experience with progress bar
- **Secure API key handling** — key stored server-side, never exposed to browser
- **Responsive design** — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| Frontend | HTML, CSS, JavaScript |
| API | ExchangeRate-API v6 |
| Flags | FlagCDN |
| Font | Inter (Google Fonts) |
| Server | Gunicorn + Nginx |

---

## Project Structure

```
kwik-exchange/
├── static/
│   ├── style.css        # All styling
│   └── script.js        # Frontend logic and API calls
├── templates/
│   └── index.html       # Main HTML template
├── app.py               # Flask backend and API routes
├── .env                 # API key (not committed)
├── .gitignore           # Ignores .env and cache files
└── requirements.txt     # Python dependencies
```

---

## Running Locally

### Prerequisites
- Python 3.x
- pip

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/taiwodotunx1/kwik-exchange.git
cd kwik-exchange
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Create your `.env` file**
```bash
touch .env
```

Add your API key inside it:
```
EXCHANGE_RATE_API_KEY=your_api_key_here
```

Get a free API key at [exchangerate-api.com](https://www.exchangerate-api.com)

**4. Run the app**
```bash
python app.py
```

**5. Open in browser**
```
http://127.0.0.1:5000
```

---

## Deployment

The app is deployed across two web servers behind a load balancer.

### Infrastructure
- **web-01:** `18.170.34.3`
- **web-02:** `3.10.143.237`
- **lb-01 (HAProxy):** `35.176.46.223`

### Steps (per server)

**1. SSH into the server**
```bash
ssh ubuntu@<server-ip> -i ~/.ssh/school
```

**2. Install dependencies**
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip nginx
pip3 install flask requests python-dotenv gunicorn
```

**3. Clone the repo**
```bash
cd /var/www
sudo git clone https://github.com/taiwodotunx1/kwik-exchange.git
cd kwik-exchange
```

**4. Create `.env` on the server**
```bash
nano .env
```
Add:
```
EXCHANGE_RATE_API_KEY=your_api_key_here
```

**5. Set up Gunicorn as a systemd service**
```bash
sudo nano /etc/systemd/system/kwik-exchange.service
```
Add:
```
[Unit]
Description=Kwik Exchange Flask App
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/kwik-exchange
ExecStart=/usr/local/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kwik-exchange
sudo systemctl start kwik-exchange
```

**6. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/kwik-exchange
```
Add:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /var/www/kwik-exchange/static/;
    }
}
```
Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/kwik-exchange /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**7. Load Balancer (HAProxy on lb-01)**

HAProxy is configured to distribute traffic between web-01 and web-02 using round-robin. SSL termination is handled at the load balancer level.

---

## API Reference

**Provider:** [ExchangeRate-API](https://www.exchangerate-api.com)

| Endpoint | Description |
|----------|-------------|
| `GET /api/rates/<base>` | Returns all exchange rates for the given base currency |
| `GET /api/codes` | Returns all supported currency codes and names |

### How it works
- The browser never contacts ExchangeRate-API directly
- All API calls go through the Flask backend
- The API key is stored in `.env` on the server — never exposed to the client

---

## Security

- API key stored in `.env` — excluded from version control via `.gitignore`
- `.env` created manually on each server after deployment
- No sensitive data is ever sent to or stored in the browser

---

## Disclaimer

Exchange rates are sourced from ExchangeRate-API and reflect mid-market rates. Rates are updated every 24 hours and are for informational purposes only. These rates may differ from those offered by banks or money transfer services.

---

## Credits

- Exchange rates: [ExchangeRate-API](https://www.exchangerate-api.com)
- Country flags: [FlagCDN](https://flagcdn.com)
- Font: [Inter by Google Fonts](https://fonts.google.com/specimen/Inter)

---

## Author

**Adedotun Taiwo**
- GitHub: [@taiwodotunx1](https://github.com/taiwodotunx1)
- School: African Leadership University (ALU)