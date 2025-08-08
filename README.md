# Slack Connect

A full-stack application that enables users to connect their Slack workspace, send messages immediately, and schedule messages for future delivery.

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Slack App with OAuth permissions

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd slack-connect
```

### 2. Slack App Configuration

1. Go to https://api.slack.com/apps
2. Create a new app "From scratch"
3. Configure OAuth & Permissions:
   - Add redirect URL: `http://localhost:3001/auth/slack/callback`
   - Add OAuth Scopes:
     - `channels:read`
     - `chat:write`
     - `chat:write.public`
     - `groups:read`
     - `im:read`
     - `mpim:read`

### 3. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
```

Configure your `.env` file:

```env
PORT=3001
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:3001/auth/slack/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
DATABASE_PATH=./data/database.sqlite
```

Start the backend:

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Configure environment (create `.env`):

```env
VITE_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Architecture Overview

### OAuth 2.0 Flow

1. User clicks "Connect to Slack"
2. Redirected to Slack OAuth page
3. After authorization, callback receives authorization code
4. Backend exchanges code for access/refresh tokens
5. Tokens stored securely in SQLite database

### Token Management

- Access Tokens: Used for API calls, expire after a certain time
- Refresh Tokens: Used to obtain new access tokens automatically
- Auto-refresh: Implemented middleware checks token validity before each API call

### Scheduled Message System

- Messages stored in SQLite with execution timestamp
- Node.js `node-cron` runs every minute to check for pending messages
- Reliable delivery with error handling and retry logic

### Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: SQLite with better-sqlite3
- Authentication: JWT tokens for session management
- Scheduling: node-cron for reliable message delivery

## Key Features

1. Secure OAuth Integration with Slack
2. Automatic Token Refresh Logic
3. Real-time Messaging Capabilities
4. Message Scheduling for Future Delivery
5. Management of Scheduled Messages (View and Cancel)
6. Responsive and Modern UI Design
7. Robust Error Handling and Feedback

## Development Notes

### Project Structure

- `backend/`: Express.js API server with TypeScript
- `frontend/`: React application with Vite and Tailwind CSS
- Applications run independently and communicate via REST API

### Database Schema

- `tokens`: Stores OAuth tokens for each user
- `scheduled_messages`: Stores pending and completed scheduled messages

### API Endpoints

- `GET /auth/slack`: Initiate OAuth flow
- `GET /auth/slack/callback`: OAuth callback
- `GET /api/channels`: Get user's channels
- `POST /api/messages/send`: Send immediate message
- `POST /api/messages/schedule`: Schedule message
- `GET /api/messages/scheduled`: Get scheduled messages
- `DELETE /api/messages/scheduled/:id`: Cancel scheduled message

## Deployment

### Backend Deployment

1. Set environment variables on your deployment platform
2. Update `FRONTEND_URL` in environment configuration
3. Update Slack app redirect URI to match your deployed backend URL

### Frontend Deployment

1. Set `VITE_API_URL` to your deployed backend URL
2. Build and deploy the React application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request