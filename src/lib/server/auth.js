// src/lib/server/auth.js
import db from './db.js';
import bcrypt from 'bcryptjs';
import { error } from '@sveltejs/kit';
import crypto from 'crypto';

export const auth = {
    /**
     * Creates a new user in the database.
     */
    async createUser(email, password, name) {
        try {
            const existingUser = await db.user.findUnique({ 
                where: { email: email.toLowerCase().trim() } 
            });
            
            if (existingUser) {
                throw error(400, 'A user with that email already exists.');
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const user = await db.user.create({
                data: { 
                    email: email.toLowerCase().trim(), 
                    passwordHash, 
                    name: name?.trim() 
                }
            });

            return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
            console.error('Error creating user:', err);
            throw error(500, 'Failed to create user');
        }
    },

    /**
     * Authenticates a user with email and password.
     */
    async authenticate(email, password) {
        try {
            const user = await db.user.findUnique({ 
                where: { email: email.toLowerCase().trim() } 
            });

            if (!user) {
                // Use consistent timing to prevent timing attacks
                await bcrypt.compare(password, '$2b$12$fakehashforconsistenttiming');
                return null;
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) return null;

            return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
            console.error('Error authenticating user:', err);
            return null;
        }
    },

    // --- SESSION LOGIC ---

    /**
     * Creates a new session for a user and stores in database.
     * Returns sessionId.
     */
    async createSession(userId) {
        try {
            const sessionId = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            await db.session.create({
                data: {
                    id: sessionId,
                    userId,
                    expiresAt
                }
            });

            return sessionId;
        } catch (err) {
            console.error('Error creating session:', err);
            throw error(500, 'Failed to create session');
        }
    },

    /**
     * Validates a session token and returns the user if valid.
     */
    async validateSession(sessionId) {
        if (!sessionId) return null;

        try {
            // Clean up expired sessions first
            await this.cleanupExpiredSessions();

            const session = await db.session.findUnique({
                where: { id: sessionId },
                include: { user: true }
            });

            if (!session) {
                return null;
            }

            if (new Date() > session.expiresAt) {
                await this.deleteSession(sessionId);
                return null;
            }

            const { user } = session;
            return { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            };
        } catch (err) {
            console.error('Error validating session:', err);
            return null;
        }
    },

    /**
     * Deletes a session (for logout).
     */
    async deleteSession(sessionId) {
        try {
            await db.session.delete({ 
                where: { id: sessionId } 
            });
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    },

    /**
     * Clean up expired sessions from database.
     */
    async cleanupExpiredSessions() {
        try {
            await db.session.deleteMany({
                where: {
                    expiresAt: { lt: new Date() }
                }
            });
        } catch (err) {
            console.error('Error cleaning up expired sessions:', err);
        }
    }
};