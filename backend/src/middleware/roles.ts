import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

const roleHierarchy: Record<UserRole, number> = {
  student: 0,
  member: 1,
  researcher: 2,
  admin: 3,
  super_admin: 4,
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const hasPermission = roles.some((role) => userRoleLevel >= roleHierarchy[role]);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');
export const requireMember = requireRole('member', 'researcher', 'admin', 'super_admin');
export const requireResearcher = requireRole('researcher', 'admin', 'super_admin');
