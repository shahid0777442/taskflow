const app = require('./app');
const { init } = require('./db');

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('JWT_SECRET and DATABASE_URL environment variables are required');
  process.exit(1);
}

(async () => {
  // Retry so the app survives while the database is still starting
  for (let i = 1; i <= 10; i++) {
    try {
      await init();
      break;
    } catch (err) {
      console.error(`DB not ready (attempt ${i}/10): ${err.message}`);
      if (i === 10) process.exit(1);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`TaskFlow running on port ${PORT}`));
})();
