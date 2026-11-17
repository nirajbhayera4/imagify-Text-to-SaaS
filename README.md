# Imagify - Text to SaaS

Imagify is a full-stack web application that converts text prompts into images using the power of AI. This project is built with the MERN stack (MongoDB, Express.js, React, Node.js) and utilizes the Razorpay API for payment processing.

## Tech Stack

**Client:**

- React
- Tailwind CSS
- Vite
- React Router
- Axios
- Motion (for animations)
- React Toastify (for notifications)

**Server:**

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (for authentication)
- Bcrypt (for password hashing)
- Razorpay (for payments)
- Axios

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/imagify-Text-to-SaaS.git
    ```
2.  **Install NPM packages for the server**
    ```sh
    cd server
    npm install
    ```
3.  **Install NPM packages for the client**
    ```sh
    cd ../client
    npm install
    ```

## Available Scripts

In the project directory, you can run:

### Client

-   `npm run dev`: Runs the app in the development mode.
-   `npm run build`: Builds the app for production.
-   `npm run lint`: Lints the code.
-   `npm run preview`: Previews the production build.

### Server

-   `npm start`: Starts the server.
-   `npm run server`: Starts the server with nodemon for automatic restarts.

## Environment Variables

Create a `.env` file in both the `client` and `server` directories and add the following variables:

### Client (`client/.env`)

```
VITE_BACKEND_URL=http://localhost:4000
```

### Server (`server/.env`)

```
MONGO_URI=<YOUR_MONGO_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
RAZORPAY_KEY_ID=<YOUR_RAZORPAY_KEY_ID>
RAZORPAY_KEY_SECRET=<YOUR_RAZORPAY_KEY_SECRET>
```

Credit plan prices are configured on the server and charged in INR. Applying credits uses a MongoDB transaction, so MongoDB must run as a replica set (MongoDB Atlas supports this).

## API Endpoints

### User Routes

-   `POST /api/users/register`: Register a new user.
-   `POST /api/users/login`: Login a user.
-   `GET /api/users/profile`: Get user profile.

### Image Routes

-   `POST /api/images/generate`: Generate an image from a text prompt.

### Payment Routes

-   `POST /api/payment/create-order`: Create a Razorpay order for a credit plan (requires the `token` header).
-   `POST /api/payment/verify`: Verify a successful checkout and add credits (requires the `token` header).

## Folder Structure

```
imagify-Text-to-SaaS/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── server/
    ├── config/
    │   └── mongodb.js
    ├── controllers/
    │   ├── imageControllers.js
    │   └── userController.js
    ├── middleWares/
    │   └── auth.js
    ├── models/
    │   └── userModel.js
    ├── .env
    ├── package.json
    └── server.js
```
