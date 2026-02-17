import { UserRole } from '../../domain/entities/User';

export const APP_NAME = 'Electron React App';
export const APP_VERSION = '1.0.0';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Re-export UserRole for convenience — single source of truth in domain layer
export { UserRole } from '../../domain/entities/User';

// Derive USER_ROLES from the UserRole enum to avoid duplication
export const USER_ROLES = {
  ADMIN: UserRole.ADMIN,
  USER: UserRole.USER,
  GUEST: UserRole.GUEST,
} as const;
