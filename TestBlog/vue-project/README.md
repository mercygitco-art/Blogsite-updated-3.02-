# Vue Blog Project

A modern blog application built with Vue 3, Vite, and integrated API support.

## Features

- User authentication (login/register)
- Blog post management (CRUD operations)
- Comments system
- Responsive design
- API integration with fallback to mock data

## API Integration

This project includes a complete API integration setup:

### API Structure

### API Structure

- `src/api/client.js` - Axios client with interceptors for auth and error handling
- `src/api/auth.js` - Authentication endpoints (login, register, logout, profile)
- `src/api/posts.js` - Blog posts CRUD operations
- `src/api/comments.js` - Comments management
- `src/api/categories.js` - Category management
- `src/api/likes.js` - Like/unlike operations for posts and comments
- `src/api/poststatushistories.js` - Post status change tracking
- `src/api/posttags.js` - Post-tag relationships
- `src/api/savedposts.js` - User saved posts management
- `src/api/tags.js` - Tag CRUD operations
- `src/api/users.js` - User management (admin operations)
- `src/api/usersettings.js` - User settings management
- `src/api/index.js` - Main API exports

### Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### API Endpoints Expected

The frontend expects the following API endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### Posts
- `GET /posts` - Get all posts (with query params)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like/unlike post

#### Comments
- `GET /posts/:postId/comments` - Get comments for a post
- `POST /posts/:postId/comments` - Create comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `POST /comments/:id/like` - Like/unlike comment

#### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get single category
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### Tags
- `GET /tags` - Get all tags
- `GET /tags/:id` - Get single tag
- `POST /tags` - Create new tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag
- `GET /tags/popular` - Get popular tags

#### Post Tags
- `GET /posts/:postId/tags` - Get tags for a post
- `POST /posts/:postId/tags` - Add tag to post
- `DELETE /posts/:postId/tags/:tagId` - Remove tag from post
- `PUT /posts/:postId/tags` - Update post tags (replace all)

#### Likes
- `GET /posts/:postId/likes` - Get likes for a post
- `POST /posts/:postId/like` - Like/unlike a post
- `POST /comments/:commentId/like` - Like/unlike a comment
- `GET /users/:userId/likes` - Get user's likes

#### Saved Posts
- `GET /users/:userId/saved-posts` - Get user's saved posts
- `POST /posts/:postId/save` - Save a post
- `DELETE /posts/:postId/save` - Unsave a post
- `GET /posts/:postId/saved` - Check if post is saved

#### Users
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get single user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin)
- `GET /users/:userId/posts` - Get user's posts
- `GET /users/:userId/comments` - Get user's comments

#### User Settings
- `GET /users/:userId/settings` - Get user settings
- `PUT /users/:userId/settings` - Update user settings
- `GET /user/settings` - Get current user's settings
- `PUT /user/settings` - Update current user's settings

#### Post Status Histories
- `GET /posts/:postId/status-history` - Get status history for a post
- `POST /posts/:postId/status-history` - Create status history entry
- `GET /post-status-histories` - Get all status histories (admin)

### Fallback Behavior

The application gracefully falls back to mock data if the API is unavailable, ensuring the app works in development without a backend.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```
