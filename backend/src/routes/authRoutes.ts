import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import { Admin } from '../models';
import { config } from '../config/env';

const router = Router();
const authController = new AuthController();

// Google OAuth setup function — called lazily on first request
let googleStrategyRegistered = false;
function ensureGoogleStrategy(): boolean {
  if (googleStrategyRegistered) return true;
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientID || !clientSecret) return false;

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `http://localhost:${config.port}/api/auth/google/callback`,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email found'), undefined);

          let admin = await Admin.findOne({ email });
          if (!admin) {
            admin = await Admin.create({
              email,
              name: profile.displayName || email,
              password: await bcrypt.hash(Math.random().toString(36), 10),
            });
          }
          done(null, admin);
        } catch (err: any) {
          done(err, undefined);
        }
      }
    )
  );
  googleStrategyRegistered = true;
  return true;
}

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  (req: Request, res: Response) => authController.login(req, res)
);

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    validate,
  ],
  (req: Request, res: Response) => authController.register(req, res)
);

router.get('/profile', authMiddleware, (req: Request, res: Response) =>
  authController.getProfile(req, res)
);

router.put(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  (req: Request, res: Response) => authController.changePassword(req, res)
);

// Google OAuth routes
router.get('/google', (req: Request, res: Response, next: NextFunction) => {
  if (!ensureGoogleStrategy()) {
    res.status(501).json({ message: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env' });
    return;
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
  if (!ensureGoogleStrategy()) {
    return res.redirect('http://localhost:3000/login?error=oauth_not_configured');
  }
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      console.error('Google OAuth error:', err);
      return res.redirect('http://localhost:3000/login?error=oauth_failed');
    }
    const token = jwt.sign({ adminId: user._id }, config.jwtSecret, { expiresIn: '24h' });
    res.redirect(`http://localhost:3000/login?token=${token}`);
  })(req, res, next);
});

export default router;
