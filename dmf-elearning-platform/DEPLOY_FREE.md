# 🚀 DMF eLearning — Free Deployment Guide

Deploy toàn bộ platform **miễn phí 100%** sử dụng các nền tảng miễn phí.

## Kiến trúc Deploy

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Vercel     │───▶│   Railway    │───▶│   Supabase   │
│  (Frontend)  │    │  (Backend)   │    │  (DB + Auth) │
│   FREE ✅    │    │   FREE ✅    │    │   FREE ✅    │
└─────────────┘    └──────────────┘    └──────────────┘
     :3000              :3003          PostgreSQL + Auth
```

## Stack miễn phí

| Service | Platform | Free Tier |
|---------|----------|-----------|
| Frontend (Next.js) | **Vercel** | Unlimited deploys, 100GB bandwidth |
| Backend (Express) | **Railway** | $5 credit/tháng, 500 hours |
| Database (PostgreSQL) | **Supabase** | 500MB, unlimitied API |
| Auth | **Supabase** | 50,000 MAU |
| Redis (Cache) | **Upstash** | 10,000 commands/ngày |
| CI/CD | **GitHub Actions** | 2,000 mins/tháng |
| Monitoring | **Better Uptime** | 10 monitors free |

---

## Bước 1: Deploy Backend lên Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init project (chạy trong thư mục learning-service)
cd services/learning-service
railway init

# 4. Add PostgreSQL
railway add --plugin postgresql

# 5. Add Redis (Upstash)
railway add --plugin redis

# 6. Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3003
railway variables set SUPABASE_JWT_SECRET=your-jwt-secret

# 7. Deploy!
railway up
```

Railway sẽ tự động:
- Detect Node.js project
- Run `npm run build`
- Run `npx prisma db push` (from railway.toml)
- Start server

**URL**: `https://dmf-api.up.railway.app`

---

## Bước 2: Deploy Frontend lên Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (chạy trong thư mục web-learner)
cd apps/web-learner
vercel

# 4. Set env variables
vercel env add NEXT_PUBLIC_API_URL     # = https://dmf-api.up.railway.app/api
vercel env add NEXT_PUBLIC_SUPABASE_URL # = https://fddwxqtkqxcsmchmzokz.supabase.co
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY # = sb_publishable_...

# 5. Deploy production
vercel --prod
```

**URL**: `https://dmf-elearning.vercel.app`

---

## Bước 3: Setup Supabase (Đã có ✅)

Anh đã có Supabase project: `https://fddwxqtkqxcsmchmzokz.supabase.co`

Cần thêm:
1. Vào **Authentication** → Enable Email/Password provider
2. Vào **SQL Editor** → Chạy migration nếu cần
3. Copy **JWT Secret** từ Settings → API → JWT Settings

---

## Bước 4: Setup Upstash Redis (Free)

```bash
# 1. Tạo account tại https://upstash.com
# 2. Create Redis database (chọn region gần nhất)
# 3. Copy REDIS_URL
# 4. Set trong Railway:
railway variables set REDIS_URL=rediss://default:xxxxx@xxx.upstash.io:6379
```

---

## Bước 5: Verify

```bash
# Backend health
curl https://dmf-api.up.railway.app/api/health

# Frontend
open https://dmf-elearning.vercel.app
```

---

## Tổng chi phí: $0/tháng 🎉

| Service | Giới hạn Free |
|---------|--------------|
| Vercel | 100GB bandwidth, unlimited deploys |
| Railway | $5 credit (~500 hours Node.js) |
| Supabase | 500MB DB, 50K users, 2GB storage |
| Upstash | 10K commands/day |
| GitHub Actions | 2,000 mins/month |
