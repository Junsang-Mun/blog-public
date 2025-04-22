# Public Repository for [junsang.dev](https://junsang.dev)

Welcome to the public repository for **junsang.dev**, a personal blog built with **SvelteKit** and **SQLite**. This repository contains the source code for the blog, including the frontend, backend, and admin console.

---

## 🚀 Project Overview

This project is a personal blog designed to showcase posts, manage content, and track visitor statistics. It includes:

- **Frontend**: Built with SvelteKit for a fast and modern user experience.
- **Backend**: Uses Prisma ORM with SQLite for database management.
- **Admin Console**: A secure admin interface for managing posts and viewing visitor logs.
- **Authentication**: GitHub OAuth for admin login.
- **Markdown Support**: Write and edit posts using a custom Markdown editor with live preview.

---

## 🌐 Live Site

Visit the live site at: [junsang.dev](https://junsang.dev)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Junsang-Mun/blog-public.git
cd blog-public
```

### 2. Install Dependencies

Make sure you have **Node.js** installed. Then, run:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory based on the provided `sample.github.env`. Ensure all keys and values are correctly set up. These include:

- **GitHub OAuth Credentials**:
  - `VITE_GITHUB_CLIENT_ID`
  - `VITE_GITHUB_CLIENT_SECRET`
  - `VITE_REDIRECT_URI`
- **Admin Email**:
  - `VITE_ADMIN_EMAIL`

For GitHub Actions, add these variables under **Secrets and Variables** in your GitHub repository settings.

### 4. Run the Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🖥️ Admin Console

The admin console is located at:

```
YOUR_URL/console
```

### Login Page

To access the admin console, visit:

```
YOUR_URL/login
```

Use your GitHub account to log in. Ensure the email associated with your GitHub account matches the `VITE_ADMIN_EMAIL` specified in the environment variables.

---

## 📂 Project Structure

Here's an overview of the key directories and files:

- **`src/`**: Contains the main application code.
  - **`routes/`**: SvelteKit routes for the blog and API.
  - **`lib/components/`**: Reusable Svelte components (e.g., Header, Footer, MarkdownEditor).
  - **`hooks.server.js`**: Middleware for logging visitor data.
- **`prisma/`**: Prisma schema and migrations for the SQLite database.
- **`static/`**: Static assets like images and fonts.
- **`sample.github.env`**: Sample environment variables file.

---

## 🛡️ Security Notes

1. **Admin Authentication**: Only users with the email specified in `VITE_ADMIN_EMAIL` can access the admin console.
2. **Session Management**: Admin sessions are stored in cookies with `httpOnly` and `secure` flags.
3. **Visitor Logs**: IP addresses and user agents are logged for analytics purposes. Ensure compliance with privacy regulations.

---

## 📝 Features

### Blog Features

- View posts with tags and metadata.
- Search functionality for posts.
- Responsive design for mobile and desktop.

### Admin Features

- Write, edit, and delete posts.
- Save drafts or publish posts.
- View visitor statistics (daily, weekly, monthly).
- Manage visitor logs (filter, paginate, and clear old logs).

---

## 📦 Deployment

This project is configured to be deployed to a **Virtual Machine (VM)** using **GitHub Actions**. The deployment process is automated and ensures that the application is built, tested, and deployed seamlessly to the target server.

### Deployment Workflow

The deployment workflow is defined in the file: `.github/workflows/deploy.yml`. It is triggered automatically on:

1. **Push to the `main` branch**: Any changes pushed to the `main` branch will trigger the deployment process.
2. **Manual Trigger**: You can manually trigger the workflow from the GitHub Actions interface using the `workflow_dispatch` event.

### Prerequisites

Before deploying, ensure the following are set up:

1. **Secrets Configuration**:
   - Add the following secrets to your GitHub repository under **Settings > Secrets and variables > Actions**:
     - `ENV_VITE_REDIRECT_URI`: The redirect URI for GitHub OAuth.
     - `ENV_VITE_GITHUB_CLIENT_SECRET`: The GitHub OAuth client secret.
     - `ENV_VITE_GITHUB_CLIENT_ID`: The GitHub OAuth client ID.
     - `ENV_VITE_ADMIN_EMAIL`: The admin email for authentication.
     - `SSH_PRIVATE_KEY`: The private SSH key for accessing the target VM.
     - `SSH_HOST`: The hostname or IP address of the target VM.
     - `SSH_USERNAME`: The username for SSH access to the VM.

2. **Target VM Setup**:
   - Ensure the VM has the following installed:
     - **Node.js** (version 22 or compatible with the app).
     - **PM2** for process management.
     - **SQLite** for the database.
   - The VM should allow SSH access using the private key provided in the GitHub secrets.

3. **Database Backup Directory**:
   - The workflow creates a `~/backups` directory on the VM to store database backups before deployment. Ensure sufficient storage is available.

### Deployment Steps

The deployment process includes the following steps:

1. **Checkout Code**: The workflow checks out the latest code from the `main` branch.
2. **Set Up Node.js**: Installs the specified Node.js version and caches dependencies.
3. **Install Dependencies**: Installs all required dependencies using `npm ci`.
4. **Environment Configuration**: Creates a `.env.production` file on the VM with the required environment variables.
5. **Build Application**: Builds the SvelteKit application for production.
6. **Generate Prisma Client**: Ensures the Prisma client is generated for database interactions.
7. **SSH Setup**: Configures SSH access to the target VM using the private key.
8. **Backup Database**: Creates a backup of the existing SQLite database (if it exists) in the `~/backups` directory.
9. **Deploy Files**: Uses `rsync` to transfer the application files to the VM, excluding unnecessary files like `.git`, `node_modules`, and the database file.
10. **Post-Deployment Commands**:
    - Ensures the SQLite database file exists.
    - Installs production dependencies.
    - Runs Prisma migrations to update the database schema.
    - Restarts the application using **PM2**.

### Manual Deployment

If you need to manually trigger the deployment workflow:

1. Go to the **Actions** tab in your GitHub repository.
2. Select the **Deploy to VM** workflow.
3. Click the **Run workflow** button and confirm.

### Monitoring the Deployment

You can monitor the deployment process in the **Actions** tab of your GitHub repository. Each step in the workflow logs its progress, making it easy to debug any issues.

### Post-Deployment

After deployment, the application will be running on the target VM. You can verify the deployment by visiting the application URL.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

---

## 📄 License

This project is licensed under the **MIT License**.

Please be noticed that the bundeled font `42dotSans` is licensed under Open Font License.

---

## 📧 Contact

For any questions or issues, please contact the repository owner at:

- **Email**: [iam@junsang.dev](iam@junsang.dev)

---

## ⚠️ Important Notes for Developers

1. **Environment Variables**: Ensure all environment variables are correctly configured before running the app.
2. **Admin Authentication**: Only authorized users can access the admin console. Unauthorized access attempts will be logged.
3. **Database**: The project uses SQLite by default. For production, consider switching to a more robust database like PostgreSQL or MySQL.
4. **Logs**: Visitor logs are stored in the database. Regularly clear old logs to maintain performance.

Happy coding! 🎉
