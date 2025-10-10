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

export const assessmentCompletionEmail = (
  user: User,
  assessmentTitle: string,
  userScore: number,
  totalPoints: number,
  percentage: number,
  userLevel: string,
  recommendedServices: { name: string; description?: string }[],
) => {
  const servicesList = recommendedServices?.length
    ? `
      <div style="background-color: #f1f8f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Based on your results, we recommend:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          ${recommendedServices
            .map(
              (s) => `
              <li style="margin-bottom: 8px;">
                <span style="font-weight: bold; color: #28a745;">${s.name}</span>
                ${s.description ? ` – <span>${s.description}</span>` : ''}
              </li>`,
            )
            .join('')}
        </ul>
      </div>
    `
    : `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">No specific recommendations available at this time. Keep up the progress! 🚀</p>
      </div>
    `;

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff;">Assessment Completed 🎉</h2>
          <p>Hello ${user.first_name || 'there'},</p>
          <p>
            Congratulations! You have successfully completed the assessment:
            <strong>${assessmentTitle}</strong>.
          </p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Score:</strong> ${userScore} / ${totalPoints}</p>
            <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
            <p><strong>Level:</strong> ${userLevel}</p>
          </div>

          ${servicesList}

          <p style="margin-top: 20px;">Keep up the good work and continue improving 🚀</p>

          <p style="margin-top: 30px;">
            Best regards,<br />
            <strong>The DigiPlus Alliance Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;
};

export const applicationUserEmail = (
  user: User,
  service: string,
  responses: Record<string, any>,
  formQuestions: Map<string, { question: string }>,
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745;">Application Submitted ✅</h2>
          <p>Hello ${user.first_name || 'there'},</p>
          <p>Thank you for submitting your application for <strong>${service}</strong>.</p>
          <p>We have received your application and will process it shortly.</p>

          <h3>Summary of your responses:</h3>
          <ul>
            ${Object.entries(responses)
              .map(
                ([key, val]) =>
                  `<li><strong>${formQuestions.get(key)?.question}:</strong> ${val}</li>`,
              )
              .join('')}
          </ul>

          <p style="margin-top: 30px;">
            Best regards,<br />
            <strong>The DigiPlus Alliance Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;
};

export const applicationAdminEmail = (
  user: User | null,
  service: string,
  responses: Record<string, any>,
  formQuestions: Map<string, { question: string }>,
  paymentAmount: number,
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc3545;">New Application Received 📩</h2>
          <p>A new application has been submitted for <strong>${service}</strong>.</p>

          <p><strong>User:</strong> ${user?.first_name || ''} ${user?.last_name || ''} (${user?.email || 'N/A'})</p>

          <h3>Responses:</h3>
          <ul>
            ${Object.entries(responses)
              .map(
                ([key, val]) =>
                  `<li><strong>${formQuestions.get(key)?.question}:</strong> ${val}</li>`,
              )
              .join('')}
          </ul>

          <p><strong>Payment Amount:</strong> ₦${paymentAmount}</p>
        </div>
      </body>
    </html>
  `;
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
  // // Additional settings to prevent connection issues
  // requireTLS: true,
  // tls: {
  //   ciphers: 'SSLv3',
  //   rejectUnauthorized: false,
  // },
  // // Increase timeouts to handle slow connections
  // connectionTimeout: 120000, // 2 minutes
  // greetingTimeout: 60000, // 1 minute
  // socketTimeout: 120000, // 2 minutes
  // debug: process.env.NODE_ENV === 'development',
  // logger: process.env.NODE_ENV === 'development',
};

export const DEFAULT_FROM_EMAIL =
  process.env.DEFAULT_FROM_EMAIL || 'support@digiplus.africa';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@digiplus.africa';
