# Deployment Guide

## Prerequisites

- Node.js 16+ installed
- PostgreSQL database (local or hosted)
- Git

## Local Development Deployment

### Quick Start (Development)

1. **Clone the repository** (if applicable)
```bash
git clone <repository-url>
cd "My App"
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

---

## Production Deployment

### Option 1: Traditional VPS/Server Deployment

#### Backend Deployment

1. **Prepare the server**
```bash
# Install Node.js and PostgreSQL
sudo apt update
sudo apt install nodejs npm postgresql
```

2. **Setup PostgreSQL database**
```bash
sudo -u postgres psql
CREATE DATABASE wms_db;
CREATE USER wms_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wms_db TO wms_user;
\q
```

3. **Deploy backend**
```bash
cd backend
npm install --production
cp .env.example .env
nano .env  # Edit with production values
```

**.env Production Settings:**
```env
DATABASE_URL="postgresql://wms_user:secure_password@localhost:5432/wms_db"
JWT_SECRET="generate-a-secure-random-string-here"
PORT=5000
NODE_ENV=production
```

4. **Run migrations**
```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Build and start**
```bash
npm run build
npm start
```

6. **Use PM2 for process management** (recommended)
```bash
npm install -g pm2
pm2 start dist/index.js --name wms-backend
pm2 startup
pm2 save
```

#### Frontend Deployment

1. **Build the frontend**
```bash
cd frontend
npm install
npm run build
```

2. **Serve with Nginx**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/wms
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable the site**
```bash
sudo ln -s /etc/nginx/sites-available/wms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 2: Docker Deployment

#### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
COPY prisma ./prisma

RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
Create `docker-compose.yml` in the root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wms_db
      POSTGRES_USER: wms_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://wms_user:secure_password@postgres:5432/wms_db
      JWT_SECRET: your-jwt-secret
      NODE_ENV: production
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm start"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

---

### Option 3: Cloud Platform Deployment

#### Heroku Deployment

**Backend:**
1. Create `Procfile` in backend:
```
web: npm start
```

2. Deploy:
```bash
heroku create wms-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret-here
git push heroku main
heroku run npx prisma migrate deploy
```

**Frontend:**
```bash
heroku create wms-frontend
heroku buildpacks:set mars/create-react-app
git push heroku main
```

#### Vercel Deployment (Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

#### Railway Deployment

1. Connect GitHub repository
2. Select backend folder
3. Add PostgreSQL database
4. Deploy frontend separately

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=generate-secure-random-string

# Server
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## Security Checklist

- [ ] Change default JWT_SECRET to a strong random string
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure CORS origins
- [ ] Use strong database passwords
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor error logs

---

## Post-Deployment

### Create Admin User
1. Navigate to frontend registration page
2. Register first admin account
3. (Optional) Disable public registration in code

### Health Checks
- Backend: `GET /health`
- Database: Check Prisma Studio or connect directly

### Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs wms-backend

# Check status
pm2 status
```

---

## Backup & Restore

### Database Backup
```bash
pg_dump -U wms_user wms_db > backup.sql
```

### Database Restore
```bash
psql -U wms_user wms_db < backup.sql
```

---

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check Node.js version (16+)
- Review logs: `pm2 logs wms-backend`

### Database connection errors
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists
- Check firewall rules

### Frontend can't connect to backend
- Verify REACT_APP_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running
- Check network/firewall

---

## Performance Optimization

1. **Database Indexing**: Already configured in Prisma schema
2. **Caching**: Consider Redis for session management
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip in Nginx
5. **Database Connection Pooling**: Configure in Prisma

---

## Scaling

### Horizontal Scaling
- Deploy multiple backend instances
- Use load balancer (Nginx, AWS ELB)
- Shared PostgreSQL database
- Session storage in Redis

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database read replicas

---

## Support & Maintenance

- Regular dependency updates
- Monitor error logs
- Database maintenance
- Security patches
- Performance monitoring
