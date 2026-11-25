import { createApp } from "./app";
import { config } from "./config/env";
import { bootstrapDatabase } from "./prisma/seed";

const app = createApp();

const startServer = async () => {
  try {
    // Automatically seed default divisions, admin and demo customer if DB connected
    await bootstrapDatabase();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ DB initial seed deferred (DB may be offline during initial build).");
  }

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`\n=================================================`);
    // eslint-disable-next-line no-console
    console.log(`🚀 DIGITAL HEROES WEB-TO-PRINT API SERVER RUNNING`);
    // eslint-disable-next-line no-console
    console.log(`📡 URL: http://localhost:${config.port}`);
    // eslint-disable-next-line no-console
    console.log(`🌱 Environment: ${config.nodeEnv}`);
    // eslint-disable-next-line no-console
    console.log(`👤 Admin Account: admin@digitalheroes.co.in / Admin@123`);
    // eslint-disable-next-line no-console
    console.log(`👤 Customer Account: customer@demo.com / Customer@123`);
    // eslint-disable-next-line no-console
    console.log(`=================================================\n`);
  });
};

startServer();
