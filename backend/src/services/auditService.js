import { supabaseAdmin } from '../config/supabase.js';

/**
 * Mask sensitive fields in audit logs
 */
const maskSensitiveFields = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password', 
    'token', 
    'secret', 
    'key', 
    'ssn', 
    'credit_card',
    'refresh_token',
    'access_token',
    'api_key',
    'private_key'
  ];
  
  const masked = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      // Recursively mask nested objects
      masked[key] = maskSensitiveFields(masked[key]);
    }
  }
  
  return masked;
};

/**
 * Audit logging service
 * Logs all CREATE, UPDATE, DELETE operations
 */
export class AuditService {
  /**
   * Log an audit event
   * @param {Object} params
   * @param {string} params.actorId - User ID performing the action
   * @param {string} params.action - CREATE, UPDATE, or DELETE
   * @param {string} params.entity - Table name (appointments, records, etc.)
   * @param {Object} params.oldData - Previous state (for UPDATE/DELETE)
   * @param {Object} params.newData - New state (for CREATE/UPDATE)
   */
  static async log({
    actorId,
    action,
    entity,
    oldData = null,
    newData = null
  }) {
    try {
      // Mask sensitive data before logging
      const safeOldData = oldData ? maskSensitiveFields(oldData) : null;
      const safeNewData = newData ? maskSensitiveFields(newData) : null;

      const { data, error } = await supabaseAdmin
        .from('appointment_audit')
        .insert({
          actor_id: actorId,
          action: action.toUpperCase(),
          entity,
          old_data: safeOldData,
          new_data: safeNewData,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Audit logging error:', error);
        // Don't throw - audit failures shouldn't break the main operation
      }

      return data;
    } catch (error) {
      console.error('Audit logging exception:', error);
      return null;
    }
  }

  /**
   * Log CREATE action
   */
  static async logCreate(actorId, entity, newData) {
    return this.log({
      actorId,
      action: 'CREATE',
      entity,
      newData
    });
  }

  /**
   * Log UPDATE action
   */
  static async logUpdate(actorId, entity, oldData, newData) {
    return this.log({
      actorId,
      action: 'UPDATE',
      entity,
      oldData,
      newData
    });
  }

  /**
   * Log DELETE action
   */
  static async logDelete(actorId, entity, oldData) {
    return this.log({
      actorId,
      action: 'DELETE',
      entity,
      oldData
    });
  }
}

