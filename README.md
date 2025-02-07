
# Samyak Rewards

A modern web application for managing rewards using a cutting-edge tech stack. This guide will help you get started with setting up the project, running the development server, and deploying it using Docker.

---

## 🛠️ Getting Started  

### Prerequisites  
- **Node.js** (v18 or later)  
- **pnpm** (Package manager)  
- **Docker** (for containerization)

---

## 🚀 Steps to Set Up the Project

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/SamyakTechLabs/samyak-rewards
   ```
   
2. **Navigate to the Project Directory**  
   ```bash
   cd samyak-rewards
   ```

3. **Install Dependencies**  
   ```bash
   pnpm install
   ```

4. **Start the Development Server**  
   ```bash
   pnpm dev
   ```
   Access the application at [http://localhost:3000](http://localhost:3000).

---

## 📏 Linting and Building for Production  

### Lint Check  
```bash
pnpm lint
```

### Build for Production  
```bash
pnpm build
```

### Start the Production Server  
```bash
pnpm start
```

---

## 🐳 Docker Instructions  

### Build and Run with Docker  

1. **Build the Docker Image**  
   ```bash
   docker build -t samyak-rewards .
   ```

2. **Run the Docker Container**  
   ```bash
   docker run -p 3000:3000 --name samyak-rewards-app samyak-rewards
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure  

- **/app**: Main application code  
- **/prisma**: Database schema and migrations  
- **/public**: Static assets  

---
