# GigFlow - Frontend

Vite + React + Tailwind CSS + Redux Toolkit frontend for GigFlow.

## Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start development server:

```bash
npm run dev
```

The app will run on `http://localhost:5173` and proxy API requests to `http://localhost:4000`.

## Features

- User registration and login (persistent with Redux)
- Browse and search open gigs
- Create new gigs
- Submit bids on gigs
- View bids (for gig owners)
- Hire freelancers (atomic transaction on backend)
- Responsive Tailwind CSS design

## Pages

- `/login` - Login page
- `/register` - Registration page
- `/gigs` - Browse all open gigs with search
- `/gigs/:gigId` - View gig details, submit/view bids
- `/create-gig` - Create a new gig
