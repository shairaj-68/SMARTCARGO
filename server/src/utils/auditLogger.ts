import AuditLog from '../models/auditLog.model';

export const logAudit = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  changes: Record<string, any> = {},
  ipAddress: string = '',
  userAgent: string = ''
): Promise<void> => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
