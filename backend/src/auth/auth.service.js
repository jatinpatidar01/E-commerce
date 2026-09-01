const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
} = require('@nestjs/common');

const { DatabaseService } = require('../database/database.service');

// ==================================================
// ENV VARIABLES
// ==================================================

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not configured');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not configured');
}

// ==================================================
// AUTH SERVICE
// ==================================================

class AuthService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // ==================================================
  // GET OTP
  // ==================================================

  async getOtp(query) {
    const email = String(query.email).trim().toLowerCase();

    try {
      // Check if user already exists
      const existing = await this.databaseService.query(
        `SELECT id FROM public.users WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
        [email],
      );

      if (existing.rows.length > 0) {
        throw new ConflictException(
          'An account with this email already exists. Please log in.',
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      // Save OTP in PostgreSQL
      await this.databaseService.query(
        `
        INSERT INTO public.otps
          (email, otp)
        VALUES
          ($1, $2)
        `,
        [email, String(otp)],
      );

      // Send via nodemailer
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        await transporter.sendMail({
          from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your Registration OTP Code',
          text: `Your OTP verification code is: ${otp}.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">Verify Your Email</h2>
              <p style="color: #374151; font-size: 14px;">Thank you for registering. Use the OTP code below to verify your email and complete account creation:</p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111827; background: #f3f4f6; padding: 14px 28px; border-radius: 10px; display: inline-block;">
                  ${otp}
                </span>
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.error(
          '[AUTH] Failed to send email via Gmail transporter:',
          mailError.message,
        );
      }

      return {
        success: true,
        message: 'OTP sent successfully to your email.',
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error('[AUTH] getOtp failed:', error);
      throw new ServiceUnavailableException(
        'The authentication service is temporarily unavailable. Please try again later.',
      );
    }
  }

  // ==================================================
  // REGISTER
  // ==================================================

  async register(registerDto) {
    const email = String(registerDto?.email ?? '')
      .trim()
      .toLowerCase();

    const password = String(registerDto?.password ?? '');
    const name = String(registerDto?.name ?? '').trim();
    const role = String(registerDto?.role ?? 'customer')
      .trim()
      .toLowerCase();
    const otp = String(registerDto?.otp ?? '').trim();

    if (!name || !email || !password || !role) {
      throw new BadRequestException(
        'Name, email, password and role are required',
      );
    }

    if (!otp) {
      throw new BadRequestException('OTP verification code is required');
    }

    try {
      // Step 14 & 15: Search PostgreSQL using email and OTP
      const otpResult = await this.databaseService.query(
        `
        SELECT id, otp
        FROM public.otps
        WHERE LOWER(TRIM(email)) = $1
        ORDER BY id DESC
        LIMIT 1
        `,
        [email],
      );

      if (otpResult.rows.length === 0) {
        throw new BadRequestException(
          'No OTP found for this email. Please click "Verify" to request an OTP.',
        );
      }

      const latestOtp = otpResult.rows[0];

      if (String(latestOtp.otp).trim() !== otp) {
        throw new BadRequestException(
          'Invalid OTP. Please check the code and try again.',
        );
      }

      // Delete used OTP
      await this.databaseService.query(`DELETE FROM public.otps WHERE id = $1`, [
        latestOtp.id,
      ]);

      const existingUserResult = await this.databaseService.query(
        `
          SELECT id
          FROM public.users
          WHERE LOWER(TRIM(email)) = $1
          LIMIT 1
          `,
        [email],
      );

      if (existingUserResult.rows.length > 0) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userResult = await this.databaseService.query(
        `
          INSERT INTO public.users
          (
            name,
            email,
            password,
            role
          )VALUES
          (
            $1,
            $2,
            $3,
            $4
          )RETURNING
            id,
            name,
            email,
            role,
            created_at
          `,
        [name, email, hashedPassword, role],
      );
      const user = userResult.rows[0];
      if (role === 'vendor') {
        await this.databaseService.query(
          `
        INSERT INTO public.vendors (
          user_id,
          business_name
        )
        VALUES ($1, $2)
      `,
          [
            user.id,
            `${name}'s Business`, // Default business name
          ],
        );
      }

      return this.issueTokens(user);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error('[AUTH] register failed:', error);
      throw new ServiceUnavailableException(
        'The authentication service is temporarily unavailable. Please try again later.',
      );
    }
  }

  ////////////////logout =============================================

  logout(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return {
      message: 'Logout successful',
    };
  }

  async login(login) {
    const email = String(login?.email ?? '')
      .trim()
      .toLowerCase();

    const password = String(login?.password ?? '');

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const userResult = await this.databaseService.query(
        `
        SELECT
          id,
          name,
          email,
          password,
          role
        FROM public.users
        WHERE LOWER(TRIM(email)) = $1
        LIMIT 1
      `,
        [email],
      );

      if (userResult.rows.length === 0) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const user = userResult.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.issueTokens(user);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('[AUTH] login failed:', error);
      throw new ServiceUnavailableException(
        'The authentication service is temporarily unavailable. Please try again later.',
      );
    }
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload;

    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // -------------------------------
    // Check payload
    // -------------------------------

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const userResult = await this.databaseService.query(
        `
          SELECT
            id,
            name,
            email,
            role
          FROM public.users
          WHERE id = $1
          LIMIT 1
          `,
        [payload.sub],
      );

      if (userResult.rows.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = userResult.rows[0];

      //  Issue new tokens
      return this.issueTokens(user);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('[AUTH] refresh failed:', error);
      throw new ServiceUnavailableException(
        'The authentication service is temporarily unavailable. Please try again later.',
      );
    }
  }

  issueTokens(user) {
    const tokenPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role || 'customer',
    };

    // -------------------------------
    // Access Token
    // -------------------------------

    const accessToken = jwt.sign(tokenPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // -------------------------------
    // Refresh Token
    // -------------------------------

    const refreshToken = jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: this.publicUser(user),
    };
  }

  // ==================================================
  // VALIDATE ACCESS TOKEN
  // ==================================================

  validateAccessToken(accessToken) {
    if (!accessToken) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      return jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  publicUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'customer',
    };
  }
}
Reflect.defineMetadata('design:paramtypes', [DatabaseService], AuthService);

Injectable()(AuthService);

module.exports = {
  AuthService,
};
