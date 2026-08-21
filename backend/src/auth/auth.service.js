const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} = require('@nestjs/common');

const {
  DatabaseService,
} = require('../database/database.service');

// ==================================================
// ENV VARIABLES
// ==================================================

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET;

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRES_IN =
  process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';


if (!ACCESS_TOKEN_SECRET) {
  throw new Error(
    'ACCESS_TOKEN_SECRET is not configured',
  );
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error(
    'REFRESH_TOKEN_SECRET is not configured',
  );
}

// ==================================================
// AUTH SERVICE
// ==================================================

class AuthService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  async register(registerDto) {
    const email = String(
      registerDto?.email ?? '',
    )
      .trim()
      .toLowerCase();

    const password = String(
      registerDto?.password ?? '',
    );

    const name = String(
      registerDto?.name ?? '',
    ).trim();

 

    if (!name || !email || !password) {
      throw new BadRequestException(
        'Name, email, and password are required',
      );
    }
   console.log("registerDto", registerDto);


    const existingUserResult =
      await this.databaseService.query(
        `
        SELECT id
        FROM public.users
        WHERE email = $1
        LIMIT 1
        `,
        [email],
      );

    if (existingUserResult.rows.length > 0) {
      throw new ConflictException(
        'User with this email already exists',
      );
    }


    const hashedPassword =
      await bcrypt.hash(password, 10);

    const userResult =
      await this.databaseService.query(
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
        [
          name,
          email,
          hashedPassword,
          'customer',
        ],
      );

    const user = userResult.rows[0];

 
    return this.issueTokens(user);
  }

  ////////////////logout =============================================

logout(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return {
    message: 'Logout successful',
  };
}

// async logout(refreshToken) {
//     if (!refreshToken) {
//       throw new UnauthorizedException(
//         'Refresh token is required',
//       );
//     }



//     let payload;

//     try {
//       payload = jwt.verify(
//         refreshToken,
//         REFRESH_TOKEN_SECRET,
//       );
//     } catch (error) {
//       throw new UnauthorizedException(
//         'Invalid or expired refresh token',
//       );
//     }
// }

  // LOGIN
  


  async login(loginDto) {
    const email = String(
      loginDto?.email ?? '',
    )
      .trim()
      .toLowerCase();

    const password = String(
      loginDto?.password ?? '',
    );

    if (!email || !password) {
      throw new BadRequestException(
        'Email and password are required',
      );
    }

    const userResult =
      await this.databaseService.query(
        `
        SELECT
          id,
          name,
          email,
          password,
          role
        FROM public.users
        WHERE email = $1
        LIMIT 1
        `,
        [email],
      );

    if (userResult.rows.length === 0) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const user = userResult.rows[0];

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    return this.issueTokens(user);
  }

  
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is required',
      );
    }

    let payload;

    try {
      payload = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
      );
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }

    // -------------------------------
    // Check payload
    // -------------------------------

    if (!payload?.sub) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // -------------------------------
    // Get user from database
    // -------------------------------

    const userResult =
      await this.databaseService.query(
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

    // -------------------------------
    // User doesn't exist
    // -------------------------------

    if (userResult.rows.length === 0) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    const user = userResult.rows[0];

    // -------------------------------
    // Issue new tokens
    // -------------------------------

    return this.issueTokens(user);
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

    const accessToken = jwt.sign(
      tokenPayload,
      ACCESS_TOKEN_SECRET,
      {
        expiresIn:
          ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    // -------------------------------
    // Refresh Token
    // -------------------------------

    const refreshToken = jwt.sign(
      tokenPayload,
      REFRESH_TOKEN_SECRET,
      {
        expiresIn:
          REFRESH_TOKEN_EXPIRES_IN,
      },
    );

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
      throw new UnauthorizedException(
        'Access token is required',
      );
    }

    try {
      return jwt.verify(
        accessToken,
        ACCESS_TOKEN_SECRET,
      );
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired access token',
      );
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
Reflect.defineMetadata(
  'design:paramtypes',
  [DatabaseService],
  AuthService,
);

Injectable()(AuthService);

module.exports = {
  AuthService,
};