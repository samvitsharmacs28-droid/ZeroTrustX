export type UserRole = 'Administrator' | 'Security Analyst' | 'Employee' | 'Contractor' | 'Auditor';

export type AccountStatus = 'Active' | 'Suspended' | 'Dormant' | 'Pending Review';

export type MFAMethod = 'FIDO2_HARDWARE_KEY' | 'AUTHENTICATOR_APP' | 'SMS_OTP' | 'NONE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: AccountStatus;
  mfaMethod: MFAMethod;
  mfaEnrolled: boolean;
  riskScore: number;
  assignedDeviceIds: string[];
  lastActiveAt: string;
  createdAt: string;
  avatarUrl?: string;
  excessivePrivileges: boolean;
  locationBaseline: string; // e.g. "San Francisco, US"
  currentLocation?: string;
}

export type DevicePosture = 'Compliant' | 'Warning' | 'Compromised' | 'Unknown';

export interface Device {
  id: string;
  name: string;
  ownerId: string;
  os: 'macOS' | 'Windows 11' | 'Linux' | 'iOS' | 'Android';
  osVersion: string;
  ipAddress: string;
  macAddress: string;
  isEncrypted: boolean;
  isEdrActive: boolean;
  isPatchCompliant: boolean;
  isJailbroken: boolean;
  trustScore: number; // 0 - 100
  posture: DevicePosture;
  lastVerifiedAt: string;
}

export type ResourceSensitivity = 'Public' | 'Internal' | 'Confidential' | 'Restricted_PCI';

export interface ProtectedResource {
  id: string;
  name: string;
  category: 'Cloud Infrastructure' | 'Financial & Billing' | 'Customer PII' | 'Engineering & Git' | 'HR & Directory';
  sensitivity: ResourceSensitivity;
  url: string;
  allowedRoles: UserRole[];
  requiredMinDeviceScore: number;
  requiresMfa: boolean;
  description: string;
}

export type PolicyAction = 'ALLOW' | 'CHALLENGE' | 'RESTRICT' | 'DENY';

export interface PolicyConditions {
  maxRiskScore?: number;
  minDeviceTrustScore?: number;
  requireMfa?: boolean;
  requireCompliantDevice?: boolean;
  allowedLocations?: string[];
  blockIfImpossibleTravel?: boolean;
  blockDormantAccounts?: boolean;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  priority: number; // 1 is highest priority
  enabled: boolean;
  action: PolicyAction;
  targetResources: string[]; // ['*'] for all or resource IDs
  targetRoles: UserRole[]; // ['*'] or specific roles
  conditions: PolicyConditions;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskSignal {
  id: string;
  name: string;
  category: 'Identity' | 'Authentication' | 'Device' | 'Location' | 'Behavior' | 'Resource';
  score: number; // 0 - 100 raw signal risk
  weight: number; // weight factor (0.05 to 0.25)
  weightedScore: number; // score * weight
  description: string;
  rawValue: string | number | boolean;
  mitigationTip?: string;
}

export interface RiskEvaluationResult {
  overallScore: number;
  classification: RiskLevel;
  signals: RiskSignal[];
  recommendedAction: PolicyAction;
  explanation: string;
  calculationTimestamp: string;
  formulaSnapshot: string;
}

export interface PolicyEvaluationResult {
  decision: PolicyAction;
  matchedPolicyId: string | null;
  matchedPolicyName: string;
  evidence: string[];
  riskResult: RiskEvaluationResult;
  humanExplanation: string;
  remediation: string;
  correlationId: string;
  timestamp: string;
}

export type SessionState = 'Active' | 'Step-up Required' | 'Restricted' | 'Revoked' | 'Expired';

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  resourceId: string;
  ipAddress: string;
  location: string;
  riskScore: number;
  state: SessionState;
  startedAt: string;
  lastEvaluatedAt: string;
  privileged: boolean;
  stepUpRequestedAt?: string;
}

export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'Open' | 'Investigating' | 'Contained' | 'Resolved';

export interface IncidentTimelineEvent {
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: string;
  userId: string;
  deviceId?: string;
  resourceId?: string;
  detectionTimestamp: string;
  riskScore: number;
  assignedAnalyst: string;
  description: string;
  evidence: string[];
  timeline: IncidentTimelineEvent[];
  resolutionNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: 'AUTHENTICATION' | 'ACCESS_DECISION' | 'POLICY_CHANGE' | 'DEVICE_POSTURE_CHANGE' | 'SESSION_TRANSITION' | 'INCIDENT_ACTION' | 'USER_ROLE_CHANGE';
  actor: string;
  target: string;
  outcome: 'ALLOWED' | 'CHALLENGED' | 'RESTRICTED' | 'DENIED' | 'MODIFIED' | 'REVOKED' | 'ISOLATED';
  reason: string;
  correlationId: string;
  details?: Record<string, any>;
}

export interface SimulationScenario {
  id: string;
  title: string;
  category: string;
  mitreTechnique: string;
  summary: string;
  targetUserId: string;
  targetDeviceId: string;
  targetResourceId: string;
  initialConditions: {
    userStatus: AccountStatus;
    mfaMethod: MFAMethod;
    devicePosture: DevicePosture;
    deviceEncrypted: boolean;
    deviceEdrActive: boolean;
    location: string;
    failedAttempts: number;
    speedKmh?: number;
  };
  simulatedEvent: {
    eventDescription: string;
    newLocation?: string;
    speedKmh?: number;
    failedAttempts?: number;
    newDevicePosture?: DevicePosture;
    edrDisabled?: boolean;
    escalatePrivilege?: boolean;
    suspiciousAction?: string;
  };
  expectedOutcome: PolicyAction;
  explanation: string;
}

export interface AccessRequest {
  id: string;
  userId: string;
  resourceId: string;
  justification: string;
  requestedDurationHours: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  riskScoreAtRequest: number;
  evaluatedDecision: PolicyAction;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface RiskConfig {
  thresholds: {
    lowMax: number;      // e.g. 29
    mediumMax: number;   // e.g. 59
    highMax: number;     // e.g. 79
  };
  weights: {
    identityVerification: number;
    mfaStrength: number;
    devicePosture: number;
    locationAnomaly: number;
    impossibleTravel: number;
    unusualTime: number;
    failedAttempts: number;
    resourceSensitivity: number;
    privilegeLevel: number;
    suspiciousActivity: number;
  };
}
