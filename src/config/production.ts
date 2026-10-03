import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

export default registerAs('production', () => ({
  mongodbConnectionUrl: process.env.PRODUCTION_MONGODB_CONNECTION_URL,
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER,
  },
  // mail: {
  //   BREVO_HOST: process.env.BREVO_HOST,
  //   BREVO_PORT: process.env.BREVO_PORT,
  //   BREVO_USER: process.env.BREVO_USER,
  //   BREVO_PASS: process.env.BREVO_PASS,
  //   MAIL_SERVICE: process.env.MAIL_SERVICE,
  //   BREVO_FROM: process.env.BREVO_FROM,
  //   BREVO_API_KEY: process.env.BREVO_API_KEY,
  // },
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  google: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
}));
