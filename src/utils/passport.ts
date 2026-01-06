import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { config } from '../config';
import { findOrCreateGoogleUser } from '../api/v1/services/auth-service';
import { UserPayload } from '../types/auth';
import { prisma } from './prisma';

// Ensure env values are always strings
const clientID = config.google.clientId as string;
const clientSecret = config.google.clientSecret as string;
const callbackURL = config.google.callbackUrl as string;

// Register Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ): Promise<void> => {
      try {
        const user = await findOrCreateGoogleUser(profile);
        const payload: UserPayload = {
          id: user.id,
          name: user.name,
          assigneeId: user.assignee ? Number(user.assignee) : null,
          email: user.email,
          role: user.role.name,
          employeeCode: user.employeeCode || null,
          department: {
            id: user.department?.id || 0,
            name: user.department?.name || '',
          },
        };
        return done(null, payload);
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, (user as UserPayload).id);
});

// Deserialize user
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true, department: true },
    });
    if (user) {
      const payload: UserPayload = {
        id: user.id,
        name: user.name,
        // assigneeId: user.,
        email: user.email,
        role: user.role.name,
        assigneeId: null, // check assignee id with google login
        employeeCode: user.employeeCode || null,
        department: {
          id: user.department?.id || 0,
          name: user.department?.name || '',
        },
      };
      done(null, payload);
    } else {
      done(new Error('User not found'));
    }
  } catch (err) {
    done(err as Error);
  }
});

// Export function to initialize passport
export const setupPassport = () => passport.initialize();
