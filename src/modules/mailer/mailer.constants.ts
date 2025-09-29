import { User } from '../user/user.schema';
import { Contact } from '../general/contact/contact.schema';

export const registrationEmail = (user: User, link: string) => {
  return `
    <html>
      <body>
        <div>
          <p>You did it! You're successfully registered.</p>
          <p>Please click the link below to verify your account:</p>
          <a href="${link}">Verify Account</a>
        </div>
      </body>
    </html>
  `;
};

export const otpEmail = (firstName: string, verificationLink: string) => {
  return `
    <html>
      <body>
        <div>
          <p>Hello ${firstName},</p>
          <p>Please use the link below to verify your email address and continue:</p>
          <a href="${verificationLink}">Verify Email</a>
        </div>
      </body>
    </html>
  `;
};

export const forgotPasswordEmail = (user: User, link: string) => {
  return `
    <html>
      <body>
        <div>
          <p>Hello ${user.first_name},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <a href="${link}">Reset Password</a>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>`;
};

// FIXED: Added missing closing tag and proper HTML structure
export const contactFormUserEmail = (contact: Contact) => {
  return `
    <html>
      <body>
        <div>
          <p>Hello ${contact.first_name},</p>
          <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
          <h3>Your Message:</h3>
          <p style="font-style: italic; background-color: #f5f5f5; padding: 10px; border-left: 3px solid #007bff;">${contact.message}</p>
          <p>In the meantime, feel free to explore our services and solutions.</p>
          <p>Best regards,<br>The DigiPlus Alliance Team</p>
        </div>
      </body>
    </html>`;
};

// FIXED: Added missing contact details in admin email
export const contactFormAdminEmail = (contact: Contact) => {
  return `
    <html>
      <body>
        <div>
          <h2 style="color: #dc3545;">New Contact Form Submission</h2>
          <p>A new contact form has been submitted on DigiPlus Alliance website.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${contact.first_name} ${contact.last_name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #856404;">Message:</h3>
            <p style="color: #856404;">${contact.message}</p>
          </div>
          
          <p style="color: #dc3545; font-weight: bold;">Please respond to this inquiry promptly.</p>
        </div>
      </body>
    </html>`;
};

// FIXED: Added missing secure property and better configuration
export const ZEPTOMAIL_CONFIG = {
  host: process.env.ZEPTOMAIL_HOST || 'smtp.zeptomail.com',
  port: parseInt(process.env.ZEPTOMAIL_PORT || '587'),
  secure: false, // IMPORTANT: Must be false for port 587
  auth: {
    user: process.env.ZEPTOMAIL_USERNAME || 'emailapikey',
    pass: process.env.ZEPTOMAIL_PASSWORD,
  },
  // Additional settings to prevent connection issues
  requireTLS: true,
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
  // Increase timeouts to handle slow connections
  connectionTimeout: 120000, // 2 minutes
  greetingTimeout: 60000, // 1 minute
  socketTimeout: 120000, // 2 minutes
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development',
};

export const DEFAULT_FROM_EMAIL =
  process.env.DEFAULT_FROM_EMAIL || 'support@digiplus.africa';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@digiplus.africa';
