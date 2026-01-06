/**
 * ALL system permissions live here.
 * This makes permissions:
 * - Type-safe
 * - Centralized
 * - Easy to audit
 */
export enum Permission {
  // ===== USER MANAGEMENT =====
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',

  // ===== INTERN MANAGEMENT =====
  CREATE_INTERN = 'CREATE_INTERN',
  EDIT_INTERN = 'EDIT_INTERN',
  DELETE_INTERN = 'DELETE_INTERN',
  VIEW_INTERNS = 'VIEW_INTERNS',

  // ===== MENTOR ACTIONS =====
  ASSIGN_TASK = 'ASSIGN_TASK',
  REVIEW_PROGRESS = 'REVIEW_PROGRESS',
  SUBMIT_FEEDBACK = 'SUBMIT_FEEDBACK',

  // ===== REPORTING =====
  VIEW_REPORTS = 'VIEW_REPORTS',
  GENERATE_REPORTS = 'GENERATE_REPORTS',

  // ===== OBSERVER =====
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
}
