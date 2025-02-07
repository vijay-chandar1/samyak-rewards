# Using Prisma in Next.js

This guide provides a comprehensive list of commands and usage instructions for integrating Prisma with a Next.js project.

---

## 1. Prisma Setup

### Install Prisma and the Prisma Client

```bash
npm install prisma @prisma/client
```

### Initialize Prisma

```bash
npx prisma init
```

This creates a `prisma` folder with a `schema.prisma` file.

---

## 2. Database Setup

### Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma Client based on your schema.

### Run Migrations

- **Create a Migration:**
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- **Apply Pending Migrations in Production:**
  ```bash
  npx prisma migrate deploy
  ```
- **Reset the Database:**
  ```bash
  npx prisma migrate reset
  ```

### Push Schema to Database (Without Migrations)

```bash
npx prisma db push
```

### Seed the Database

- **Using `prisma/seed.js`:**
  Add a `seed` script in `package.json`:

  ```json
  "prisma": {
    "seed": "node prisma/seed.js"
  }
  ```

  Then run:

  ```bash
  npx prisma db seed

  or

  node prisma/seed.js
  ```

- **Default Seeder:**
  Use the default seed setup provided in Prisma.

---

## 3. Database Inspection

### Introspect Existing Database

```bash
npx prisma db pull
```

### View the Database Schema

```bash
npx prisma studio
```

This launches a web interface to interact with your database.

---

## 4. Query and Development Tools

### Start the Prisma Studio

```bash
npx prisma studio
```

### Query Raw SQL

Use `prisma.$queryRaw` and `prisma.$executeRaw` in your code for raw SQL queries.

---

## 5. Deployment

### Prepare the Production Environment

Ensure the Prisma Client is generated in the production build process by adding the following script to `package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Run Migrations in Production

```bash
npx prisma migrate deploy
```

---

## 6. Debugging and Cleanup

### Validate Prisma Schema

```bash
npx prisma validate
```

### Check Environment Variables

```bash
npx prisma env check
```

### Preview Features (Optional)

```bash
npx prisma --preview-feature
```

---

## 7. Next.js Specific Integration

Prisma works seamlessly with Next.js API routes or server-side functions.

### Example API Route

```javascript
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const data = await prisma.user.findMany();
  res.json(data);
}
```

### Dynamic Imports for Prisma

To avoid issues with hot reloading in development, use the following helper:

```javascript
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
```

---

## Additional Notes

- Refer to the [Prisma Documentation](https://www.prisma.io/docs) for more details.
- Always validate your schema after changes.

---

Happy coding!
