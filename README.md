# Saturn — Mini Social Media App

Saturn is a simple full-stack social media website built for the CodeAlpha Internship Task 2.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT + bcrypt
- Icons: Font Awesome CDN

## Features

- User registration and login
- Logout
- User profile pages
- Create posts
- View feed
- Like/unlike posts
- Comment on posts
- Follow/unfollow users
- Follower/following counts
- Delete your own posts
- Responsive layout

## Project Structure

```text
Saturn/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── comments.js
│   │   ├── follows.js
│   │   ├── likes.js
│   │   └── posts.js
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
├── database/
│   └── schema.sql
├── frontend/
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── create-post.html
│   ├── index.html
│   ├── login.html
│   ├── profile.html
│   └── register.html
├── .env.example
├── .gitignore
└── README.md
```

## Database

This project uses the existing MySQL database named `saturn`.

The supplied `database/schema.sql` is unchanged and creates these tables:

- `users`
- `posts`
- `comments`
- `likes`
- `followers`

If your `saturn` database is already set up, **do not recreate it**. The application will use the same database configured in `backend/.env`.

For a fresh installation, run:

```sql
SOURCE database/schema.sql;
```

## Backend setup

Open a terminal in:

```text
Saturn/backend
```

Create:

```text
backend/.env
```

using `backend/.env.example` as the template.

Example:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=saturn
JWT_SECRET=replace_with_a_long_secret
```

Never commit `.env` to GitHub.

Install packages:

```bash
npm install
```

Start the backend:

```bash
npm start
```

You should see:

```text
Saturn is running at http://localhost:5000
```

## Running with Express

The backend also serves the frontend itself.

Open:

```text
http://localhost:5000
```

This is the simplest way to run the complete application.

## Running with VS Code Live Server

The frontend is also configured to work when `frontend/index.html` is opened with VS Code Live Server.

### 1. Start the backend first

From `Saturn/backend`:

```bash
npm start
```

Keep this terminal running.

### 2. Open the frontend

In VS Code, right-click:

```text
frontend/index.html
```

and select:

```text
Open with Live Server
```

Live Server will normally open something like:

```text
http://127.0.0.1:5500/frontend/index.html
```

The frontend automatically sends API requests to:

```text
http://localhost:5000/api
```

So the backend **must remain running** while using Live Server.

### Important

Do not open:

```text
http://127.0.0.1:5500/login.html
```

Use the links inside the application, or open:

```text
http://127.0.0.1:5500/frontend/index.html
```

The frontend uses relative paths so navigation, CSS, JavaScript and images work in both Live Server and Express mode.

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Users

```text
GET  /api/users/me
GET  /api/users/by/:username
PUT  /api/users/me
```

### Posts

```text
GET    /api/posts
POST   /api/posts
DELETE /api/posts/:id
GET    /api/posts/user/:userId
```

### Likes

```text
POST /api/likes/:postId
```

### Comments

```text
GET  /api/comments/post/:postId
POST /api/comments
```

### Follows

```text
POST /api/follows/:userId
```

### Health check

```text
GET /api/health
```

## Testing checklist

- [ ] Backend starts on port 5000
- [ ] MySQL connects successfully
- [ ] Register works
- [ ] Login works
- [ ] Logout works
- [ ] Feed loads
- [ ] Create post works
- [ ] Delete own post works
- [ ] Like/unlike works
- [ ] Comments work
- [ ] Profile works
- [ ] Follow/unfollow works
- [ ] Live Server frontend works
- [ ] Express-served frontend works

## Security

- Passwords are hashed with bcrypt.
- Authentication uses JWT.
- `.env` is ignored by Git.
- Do not publish MySQL credentials or JWT secrets.
- Use HTTPS and a production database when deploying.
