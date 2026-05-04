# MongoDB Setup for GigFlow

## Option 1: Use MongoDB Community Server (Windows)

Download from: https://www.mongodb.com/try/download/community
- Install MongoDB Community Server
- Ensure mongod service is running
- Default: mongodb://localhost:27017

## Option 2: Use MongoDB Atlas (Cloud - Free)

1. Create account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: mongodb+srv://username:password@cluster.mongodb.net/gigflow
4. Update .env file in backend/

## Option 3: Use MongoDB Docker

```
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Current Status
- Frontend: Running on http://localhost:5173
- Backend: Ready to start (waiting for MongoDB connection)

After MongoDB is running, start backend with:
```
cd backend
npm run dev
```
