// import { User } from '../user/user.schema';

// export const registrationEmail = (user: User, link: string) => {
//   return `<html>
//             <body>
//               <div>

//                 <p>You did it! You registered! You're successfully registered.</p>
//                 <p>Please click the link below to verify your account:</p>
//                 <a href="${link}">Verify Account</a>
//               </div>
//             </body>
//           </html>
//   `;
// };

// export const forgotPasswordEmail = (password: string) => {
//   return `<html>
//             <body>
//               <div>
//                 <p>Request Reset Password Successfully!  ✔</p>
//                 <p>This is your new password: <b>${password}</b></p>
//               </div>
//             </body>
//           </html>
//   `;
// };

// export const changePasswordEmail = (user) => {
//   return `<html>
//             <body>
//               <div>
//                 <p>Change Password Successfully! ✔ </p>
//                 <p>this is your new password: ${user.password}</p>
//               </div>
//             </body>
//           </html>
//   `;
// };

// export const otpEmail = (name: string, link: string) => {
//   return `<html>
//             <body>
//               <div>
//                 <p>Hi, ${name}! </p>
//                 <p>Please click the link below to verify your account:</p>
//                 <a href="${link}">Verify Account</a>
//               </div>
//             </body>
//           </html>
//   `;
// };

// export const forgotPasswordOtpEmail = (name: string, link: string) => {
//   return `<html>
//             <body>
//               <div>
//                 <p>Hi, ${name}! </p>
//                 <p>Please click the link below to reset your password:</p>
//                 <a href="${link}">Reset Password</a>
//               </div>
//             </body>
//           </html>
//   `;
// };

// export const userAccountCreationEmail = (
//   name: string,
//   password: string,
// ): string => {
//   return `<html>
//             <body>
//               <div>
//                 <p>Hi ${name},</p>
//                 <p>Your account has been successfully created!</p>

//                 <p><a href="https://digiplus.africa/auth/login" target="_blank" style="color: #007bff;">Log in to your account</a></p>
//                 <p>Thank you!</p>
//               </div>
//             </body>
//           </html>
//   `;
// };

// src/mailer/mailer.constants.ts

import { User } from '../user/user.schema';

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

// --- Suggested change in mailer.constants.ts ---
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

export const ZEPTOMAIL_CONFIG = {
  host: process.env.ZEPTOMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZEPTOMAIL_USERNAME,
    pass: process.env.ZEPTOMAIL_PASSWORD,
  },
};

export const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL;
