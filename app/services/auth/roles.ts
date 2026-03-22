/**
 * Role-Based Access Control Service
 * T0016: Team & Access Control
 */

export type Role = 'admin' | 'translator' | 'manager' | 'viewer';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface TeamMember {
  id: string;
  userId: string;
  shopId: string;
  role: Role;
  email: string;
  name: string;
  invitedBy: string;
  invitedAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'active' | 'inactive';
  apiKey?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: Role;
  shopId: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
}

// Role permission definitions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: 'manage' },
  ],
  translator: [
    { resource: 'translation', action: 'create' },
    { resource: 'translation', action: 'read' },
    { resource: 'translation', action: 'update' },
    { resource: 'glossary', action: 'read' },
    { resource: 'settings', action: 'read' },
  ],
  manager: [
    { resource: 'translation', action: 'read' },
    { resource: 'translation', action: 'update' },
    { resource: 'task', action: 'create' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'report', action: 'read' },
    { resource: 'team', action: 'read' },
    { resource: 'settings', action: 'read' },
  ],
  viewer: [
    { resource: 'translation', action: 'read' },
    { resource: 'report', action: 'read' },
    { resource: 'settings', action: 'read' },
  ],
};

// Storage (in production, use database)
const teamMembers: Map<string, TeamMember> = new Map();
const invites: Map<string, TeamInvite> = new Map();

/**
 * Check if role has permission
 */
export function hasPermission(
  role: Role,
  resource: string,
  action: Permission['action']
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  
  return permissions.some((p) => {
    if (p.resource === '*') return true;
    if (p.resource === resource && (p.action === action || p.action === 'manage')) return true;
    return false;
  });
}

/**
 * Check multiple permissions
 */
export function hasPermissions(
  role: Role,
  required: Permission[]
): boolean {
  return required.every((p) => hasPermission(role, p.resource, p.action));
}

/**
 * Invite team member
 */
export function inviteTeamMember(
  email: string,
  role: Role,
  shopId: string,
  invitedBy: string
): TeamInvite {
  const invite: TeamInvite = {
    id: `inv_${Date.now()}`,
    email,
    role,
    shopId,
    invitedBy,
    invitedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: 'pending',
    token: generateInviteToken(),
  };

  invites.set(invite.id, invite);
  return invite;
}

/**
 * Accept team invitation
 */
export function acceptInvite(
  token: string,
  userId: string,
  name: string
): TeamMember | null {
  const invite = Array.from(invites.values()).find((i) => i.token === token);
  
  if (!invite || invite.status !== 'pending') {
    return null;
  }

  if (new Date() > invite.expiresAt) {
    invite.status = 'expired';
    return null;
  }

  // Create team member
  const member: TeamMember = {
    id: `tm_${Date.now()}`,
    userId,
    shopId: invite.shopId,
    role: invite.role,
    email: invite.email,
    name,
    invitedBy: invite.invitedBy,
    invitedAt: invite.invitedAt,
    acceptedAt: new Date(),
    status: 'active',
  };

  teamMembers.set(member.id, member);
  
  // Update invite
  invite.status = 'accepted';

  return member;
}

/**
 * Get team members for a shop
 */
export function getTeamMembers(shopId: string): TeamMember[] {
  return Array.from(teamMembers.values()).filter((m) => m.shopId === shopId);
}

/**
 * Get pending invites for a shop
 */
export function getPendingInvites(shopId: string): TeamInvite[] {
  return Array.from(invites.values()).filter(
    (i) => i.shopId === shopId && i.status === 'pending'
  );
}

/**
 * Update member role
 */
export function updateMemberRole(
  memberId: string,
  newRole: Role,
  updatedBy: string
): TeamMember | null {
  const member = teamMembers.get(memberId);
  if (!member) return null;

  // Only admin can change roles
  const updater = Array.from(teamMembers.values()).find(
    (m) => m.userId === updatedBy && m.shopId === member.shopId
  );
  
  if (!updater || updater.role !== 'admin') {
    return null;
  }

  member.role = newRole;
  return member;
}

/**
 * Remove team member
 */
export function removeTeamMember(
  memberId: string,
  removedBy: string
): boolean {
  const member = teamMembers.get(memberId);
  if (!member) return false;

  // Only admin can remove members
  const remover = Array.from(teamMembers.values()).find(
    (m) => m.userId === removedBy && m.shopId === member.shopId
  );
  
  if (!remover || remover.role !== 'admin') {
    return false;
  }

  member.status = 'inactive';
  return true;
}

/**
 * Generate API key for member
 */
export function generateApiKey(memberId: string): string {
  const member = teamMembers.get(memberId);
  if (!member) return '';

  const apiKey = `rtl_${Buffer.from(`${memberId}_${Date.now()}`).toString('base64')}`;
  member.apiKey = apiKey;
  return apiKey;
}

/**
 * Validate API key
 */
export function validateApiKey(apiKey: string): TeamMember | null {
  return Array.from(teamMembers.values()).find((m) => m.apiKey === apiKey) || null;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role, locale: string = 'en'): string {
  const names: Record<Role, Record<string, string>> = {
    admin: { en: 'Administrator', ar: 'مدير' },
    translator: { en: 'Translator', ar: 'مترجم' },
    manager: { en: 'Manager', ar: 'مدير' },
    viewer: { en: 'Viewer', ar: 'مشاهد' },
  };

  return names[role][locale] || names[role].en;
}

/**
 * Get role permissions list
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Generate secure invite token
 */
function generateInviteToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
