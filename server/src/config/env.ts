import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "digital_heroes_production_jwt_secret_key_2026_level2",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  uploadDir: path.resolve(__dirname, "../../uploads"),
  outputDir: path.resolve(__dirname, "../../outputs"),
};
