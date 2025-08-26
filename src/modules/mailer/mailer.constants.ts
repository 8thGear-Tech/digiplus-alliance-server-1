import { User } from '../user/user.schema';

export const registrationEmail = (user: User, link: string) => {
  return `<html>
            <body>
              <div>
         
                <p>You did it! You registered! You're successfully registered.</p>
                <p>Please click the link below to verify your account:</p>
                <a href="${link}">Verify Account</a>
              </div>
            </body>
          </html>
  `;
};

export const forgotPasswordEmail = (password: string) => {
  return `<html>
            <body>
              <div>
                <p>Request Reset Password Successfully!  ✔</p>
                <p>This is your new password: <b>${password}</b></p>
              </div>
            </body>
          </html>
  `;
};

export const changePasswordEmail = (user) => {
  return `<html>
            <body>
              <div>
                <p>Change Password Successfully! ✔ </p>
                <p>this is your new password: ${user.password}</p>
              </div>
            </body>
          </html>
  `;
};

export const otpEmail = (name: string, link: string) => {
  return `<html>
            <body>
              <div>
                <p>Hi, ${name}! </p>
                <p>Please click the link below to verify your account:</p>
                <a href="${link}">Verify Account</a>
              </div>
            </body>
          </html>
  `;
};

export const forgotPasswordOtpEmail = (name: string, link: string) => {
  return `<html>
            <body>
              <div>
                <p>Hi, ${name}! </p>
                <p>Please click the link below to reset your password:</p>
                <a href="${link}">Reset Password</a>
              </div>
            </body>
          </html>
  `;
};

export const userAccountCreationEmail = (
  name: string,
  password: string,
): string => {
  return `<html>
            <body>
              <div>
                <p>Hi ${name},</p>
                <p>Your account has been successfully created!</p>
               
               
                <p><a href="https://digiplus.africa/auth/login" target="_blank" style="color: #007bff;">Log in to your account</a></p>
                <p>Thank you!</p>
              </div>
            </body>
          </html>
  `;
};
