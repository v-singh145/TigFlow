# GigFlow - Backend

Simple backend for the GigFlow internship assignment.

Requirements
- Node.js
- MongoDB

Setup
1. Copy `.env.example` to `.env` and edit values.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run in development:

```bash
npm run dev
```

Endpoints
- `POST /api/auth/register` - register
- `POST /api/auth/login` - login (sets HttpOnly cookie)
- `GET /api/gigs` - list open gigs (`?search=` optional)
- `POST /api/gigs` - create gig (auth)
- `POST /api/bids` - submit bid (auth)
- `GET /api/bids/:gigId` - list bids for a gig (owner only)
- `PATCH /api/bids/:bidId/hire` - hire a bid (owner only)
