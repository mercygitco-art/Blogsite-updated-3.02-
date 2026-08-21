# Blogsite Backend API

Simple Node.js backend for managing blog posts with MongoDB integration.

## Features

- Create new blog posts
- Retrieve all posts (sorted by newest first)
- Retrieve single post by ID
- Update existing posts
- Delete posts
- CORS enabled for frontend communication

## Setup

### Prerequisites

- Node.js installed
- MongoDB running locally or remote connection string

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update `.env` file with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/blogsite
PORT=3000
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```
Server runs on `http://localhost:3000`

Or with auto-reload during development:
```bash
npm run dev
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if server is running

### Posts

#### Get All Posts
```
GET /api/posts
```
Returns array of all posts sorted by creation date (newest first)

#### Get Single Post
```
GET /api/posts/:id
```
Returns a specific post by ID

#### Create New Post
```
POST /api/posts
Content-Type: application/json

{
  "title": "Post Title",
  "content": "Full post content",
  "excerpt": "Optional summary",
  "category": "Optional category"
}
```

#### Update Post
```
PUT /api/posts/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "excerpt": "Updated summary",
  "category": "Updated category"
}
```

#### Delete Post
```
DELETE /api/posts/:id
```

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── Post.js              # Post schema
├── routes/
│   └── posts.js             # Post endpoints
├── server.js                # Main server file
├── package.json
├── .env                     # Environment variables
└── README.md
```

## Example Requests

### Create a post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first blog post",
    "category": "Technology"
  }'
```

### Get all posts
```bash
curl http://localhost:3000/api/posts
```

### Update a post
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

### Delete a post
```bash
curl -X DELETE http://localhost:3000/api/posts/POST_ID
```
