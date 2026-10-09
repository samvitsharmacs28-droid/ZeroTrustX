import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Device,
  ProtectedResource,
  Policy,
  Session,
  Incident,
  AuditLog,
  SimulationScenario,
  AccessRequest,
  RiskConfig,
  UserRole,
  PolicyEvaluationResult,
  DevicePosture,
  AccountStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DEVICES,
  INITIAL_RESOURCES,
  INITIAL_POLICIES,
  INITIAL_SESSIONS,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_RISK_CONFIG,
  SIMULATION_SCENARIOS,
} from '../services/demoData';
import { RiskEngine, RiskInputContext } from '../services/riskEngine';
import { PolicyEngine } from '../services/policyEngine';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface SimulationRunResult {
  scenario: SimulationScenario;
  evaluation: PolicyEvaluationResult;
  initialScore: number;
  finalScore: number;
  incidentCreated?: Incident;
  sessionsUpdated: number;
}

interface ZeroTrustContextType {
  // State
  users: User[];
  devices: Device[];
  resources: ProtectedResource[];
  policies: Policy[];
  sessions: Session[];
  incidents: Incident[];
  auditLogs: AuditLog[];
  accessRequests: AccessRequest[];
  riskConfig: RiskConfig;
  activeRole: UserRole;
  activeUser: User;
  simulationScenarios: SimulationScenario[];
  activeScenario: SimulationScenario | null;
  simulationRunning: boolean;
  lastSimulationResult: SimulationRunResult | null;
  toasts: Toast[];
  signatureActive: boolean;
  signatureStep: number;

  // Calculators
  riskEngine: RiskEngine;
  policyEngine: PolicyEngine;
  postureScore: number;
  activeSessionsCount: number;
  privilegedSessionsCount: number;
  highRiskIdentitiesCount: number;
  policyViolationsCount: number;

  // Actions
  setActiveRole: (role: UserRole) => void;
  setActiveUserById: (userId: string) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Evaluation & Playground
  evaluateAccess: (
    userId: string,
    resourceId: string,
    deviceId?: string,
    overrides?: Partial<RiskInputContext>
  ) => PolicyEvaluationResult;

  // Simulations
  runSimulation: (scenarioId: string) => Promise<SimulationRunResult>;
  resetToDefaultData: () => void;

  // Signature Demo
  startSignatureDemo: () => void;
  nextSignatureStep: () => void;
  prevSignatureStep: () => void;
  resetSignatureDemo: () => void;
  setSignatureStep: (step: number) => void;

  // Identity
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'riskScore'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  // Device
  updateDevicePosture: (deviceId: string, posture: DevicePosture) => void;
  toggleDeviceEncryption: (deviceId: string) => void;
  toggleDeviceEdr: (deviceId: string) => void;
  toggleDevicePatch: (deviceId: string) => void;

  // Policy
  addPolicy: (policy: Omit<Policy, 'id' | 'version' | 'updatedAt'>) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  deletePolicy: (id: string) => void;
  togglePolicy: (id: string) => void;

  // Sessions
  revokeSession: (sessionId: string, reason?: string) => void;
  challengeSession: (sessionId: string) => void;
  restrictSession: (sessionId: string) => void;

  // Incidents
  updateIncidentStatus: (id: string, status: Incident['status'], notes?: string) => void;
  isolateIncidentDevice: (incidentId: string) => void;

  // Access Requests
  createAccessRequest: (resourceId: string, justification: string, hours: number) => void;
  approveAccessRequest: (id: string) => void;
  rejectAccessRequest: (id: string) => void;

  // Configuration
  updateRiskConfig: (config: RiskConfig) => void;
}

const STORAGE_KEY = 'zerotrustx_v2_state';

const ZeroTrustContext = createContext<ZeroTrustContextType | null>(null);

export const ZeroTrustProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage if available
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [devices, setDevices] = useState<Device[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_devices`);
      return saved ? JSON.parse(saved) : INITIAL_DEVICES;
    } catch {
      return INITIAL_DEVICES;
    }
  });

  const [resources] = useState<ProtectedResource[]>(INITIAL_RESOURCES);

  const [policies, setPolicies] = useState<Policy[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_policies`);
      return saved ? JSON.parse(saved) : INITIAL_POLICIES;
    } catch {
      return INITIAL_POLICIES;
    }
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_incidents`);
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
      return saved ? JSON.parse(saved) : INITIAL_ACCESS_REQUESTS;
    } catch {
      return INITIAL_ACCESS_REQUESTS;
    }
  });

  const [riskConfig, setRiskConfig] = useState<RiskConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : INITIAL_RISK_CONFIG;
    } catch {
      return INITIAL_RISK_CONFIG;
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole>('Administrator');
  const [activeUserId, setActiveUserId] = useState<string>('usr-001');
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [lastSimulationResult, setLastSimulationResult] = useState<SimulationRunResult | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Signature Demo Guided Walkthrough state
  const [signatureActive, setSignatureActive] = useState<boolean>(false);
  const [signatureStep, setSignatureStep] = useState<number>(1);

  // Initialize Engines
  const riskEngine = useMemo(() => new RiskEngine(riskConfig), [riskConfig]);
  const policyEngine = useMemo(() => new PolicyEngine(), []);

  // Active user resolver
  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || users[0];
  }, [users, activeUserId]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_devices`, JSON.stringify(devices));
      localStorage.setItem(`${STORAGE_KEY}_policies`, JSON.stringify(policies));
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY}_incidents`, JSON.stringify(incidents));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(accessRequests));
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(riskConfig));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [users, devices, policies, sessions, incidents, auditLogs, accessRequests, riskConfig]);

  // Toast manager
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Posture score computed dynamically from all live devices, users, and incidents
  const postureScore = useMemo(() => {
    if (devices.length === 0 || users.length === 0) return 85;
    const avgDeviceTrust = devices.reduce((sum, d) => sum + d.trustScore, 0) / devices.length;
    const avgUserHealth = 100 - (users.reduce((sum, u) => sum + u.riskScore, 0) / users.length);
    const openCriticals = incidents.filter((i) => i.status === 'Open' && i.severity === 'Critical').length;
    const openHighs = incidents.filter((i) => i.status === 'Open' && i.severity === 'High').length;
    const penalty = (openCriticals * 15) + (openHighs * 7);
    const score = Math.round((avgDeviceTrust * 0.5) + (avgUserHealth * 0.5) - penalty);
    return Math.max(10, Math.min(100, score));
  }, [devices, users, incidents]);

  // Metric counts derived strictly from actual records
  const activeSessionsCount = useMemo(() => sessions.filter((s) => s.state === 'Active').length, [sessions]);
  const privilegedSessionsCount = useMemo(() => sessions.filter((s) => s.privileged && s.state === 'Active').length, [sessions]);
  const highRiskIdentitiesCount = useMemo(() => users.filter((u) => u.riskScore >= 60).length, [users]);
  const policyViolationsCount = useMemo(() => {
    return auditLogs.filter((a) => a.outcome === 'DENIED' || a.outcome === 'REVOKED').length;
  }, [auditLogs]);

  // General evaluation method
  const evaluateAccess = useCallback(
    (
      userId: string,
      resourceId: string,
      deviceId?: string,
      overrides?: Partial<RiskInputContext>
    ): PolicyEvaluationResult => {
      const user = users.find((u) => u.id === userId) || users[0];
      const targetDevice = deviceId
        ? devices.find((d) => d.id === deviceId)
        : devices.find((d) => user.assignedDeviceIds.includes(d.id)) || devices[0];
      const resource = resources.find((r) => r.id === resourceId) || resources[0];

      const riskResult = riskEngine.evaluateRisk({
        user,
        device: targetDevice,
        resource,
        location: overrides?.location || user.currentLocation || user.locationBaseline,
        speedKmh: overrides?.speedKmh || 0,
        failedAttempts: overrides?.failedAttempts || 0,
        isOffHours: overrides?.isOffHours || false,
        suspiciousActivityFlag: overrides?.suspiciousActivityFlag || false,
        suspiciousActivityDetail: overrides?.suspiciousActivityDetail,
        overrideDevicePosture: overrides?.overrideDevicePosture,
      });

      return policyEngine.evaluate({
        user,
        device: targetDevice,
        resource,
        riskResult,
        policies,
        location: overrides?.location,
        speedKmh: overrides?.speedKmh,
      });
    },
    [users, devices, resources, policies, riskEngine, policyEngine]
  );

  // Attack Simulation Execution
  const runSimulation = useCallback(
    async (scenarioId: string): Promise<SimulationRunResult> => {
      const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

      setSimulationRunning(true);
      setActiveScenario(scenario);

      const targetUser = users.find((u) => u.id === scenario.targetUserId) || users[0];
      const targetDevice = devices.find((d) => d.id === scenario.targetDeviceId) || devices[0];
      const targetResource = resources.find((r) => r.id === scenario.targetResourceId) || resources[0];

      // Initial baseline score
      const initialRiskResult = riskEngine.evaluateRisk({
        user: targetUser,
        device: targetDevice,
        resource: targetResource,
      });

      // Simulate network latency / engine processing
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Construct modified context based on the attack scenario
      const isDeviceCompromised = scenario.simulatedEvent.newDevicePosture === 'Compromised';
      const isSpeedTrip = (scenario.simulatedEvent.speedKmh || 0) > 800;

      const updatedDevicePosture = scenario.simulatedEvent.newDevicePosture || targetDevice.posture;
      const updatedEdr = scenario.simulatedEvent.edrDisabled !== undefined ? false : targetDevice.isEdrActive;

      // Update Device in application state
      if (scenario.simulatedEvent.newDevicePosture || scenario.simulatedEvent.edrDisabled) {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === targetDevice.id) {
              const newTrust = isDeviceCompromised ? 15 : d.trustScore;
              return {
                ...d,
                posture: updatedDevicePosture,
                isEdrActive: updatedEdr,
                trustScore: newTrust,
                lastVerifiedAt: new Date().toISOString(),
              };
            }
            return d;
          })
        );
      }

      // Re-evaluate with updated attack conditions
      const simulatedEvaluation = evaluateAccess(targetUser.id, targetResource.id, targetDevice.id, {
        location: scenario.simulatedEvent.newLocation || targetUser.currentLocation,
        speedKmh: scenario.simulatedEvent.speedKmh,
        failedAttempts: scenario.simulatedEvent.failedAttempts,
        suspiciousActivityFlag: !!scenario.simulatedEvent.suspiciousAction,
        suspiciousActivityDetail: scenario.simulatedEvent.suspiciousAction,
        overrideDevicePosture: updatedDevicePosture,
      });

      const finalRiskScore = simulatedEvaluation.riskResult.overallScore;

      // Update User risk score in state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUser.id) {
            return {
              ...u,
              riskScore: finalRiskScore,
              currentLocation: scenario.simulatedEvent.newLocation || u.currentLocation,
            };
          }
          return u;
        })
      );

      // Transition affected active sessions
      let sessionsUpdated = 0;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.userId === targetUser.id || s.deviceId === targetDevice.id) {
            sessionsUpdated++;
            let newState: Session['state'] = s.state;
            if (simulatedEvaluation.decision === 'DENY') {
              newState = 'Revoked';
            } else if (simulatedEvaluation.decision === 'CHALLENGE') {
              newState = 'Step-up Required';
            } else if (simulatedEvaluation.decision === 'RESTRICT') {
              newState = 'Restricted';
            }
            return {
              ...s,
              state: newState,
              riskScore: finalRiskScore,
              lastEvaluatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );

      // Auto-create Incident if outcome is DENY or risk is High/Critical
      let createdIncident: Incident | undefined;
      if (simulatedEvaluation.decision === 'DENY' || finalRiskScore >= 60) {
        createdIncident = {
          id: `inc-sim-${Date.now().toString(36)}`,
          title: `[Simulated] ${scenario.title}`,
          severity: finalRiskScore >= 80 ? 'Critical' : 'High',
          status: 'Open',
          source: 'Attack Simulation Laboratory',
          userId: targetUser.id,
          deviceId: targetDevice.id,
          resourceId: targetResource.id,
          detectionTimestamp: new Date().toISOString(),
          riskScore: finalRiskScore,
          assignedAnalyst: 'Marcus Vance',
          description: scenario.summary,
          evidence: simulatedEvaluation.evidence,
          timeline: [
            {
              timestamp: new Date().toISOString(),
              action: `Simulation launched: ${scenario.simulatedEvent.eventDescription}`,
              actor: 'ZeroTrustX SimEngine',
            },
            {
              timestamp: new Date().toISOString(),
              action: `Decision enforced: ${simulatedEvaluation.decision} via ${simulatedEvaluation.matchedPolicyName}`,
              actor: 'Policy Engine',
            },
          ],
        };

        setIncidents((prev) => [createdIncident!, ...prev]);
      }

      // Record Audit Log entry
      const newAudit: AuditLog = {
        id: `aud-sim-${Date.now().toString(36)}`,
        timestamp: new Date().toISOString(),
        eventType: 'ACCESS_DECISION',
        actor: `${targetUser.name} (${targetUser.id})`,
        target: targetResource.name,
        outcome: simulatedEvaluation.decision === 'ALLOW' ? 'ALLOWED' :
                 simulatedEvaluation.decision === 'CHALLENGE' ? 'CHALLENGED' :
                 simulatedEvaluation.decision === 'RESTRICT' ? 'RESTRICTED' : 'DENIED',
        reason: simulatedEvaluation.humanExplanation,
        correlationId: simulatedEvaluation.correlationId,
        details: {
          scenarioId: scenario.id,
          initialScore: initialRiskResult.overallScore,
          finalScore: finalRiskScore,
          decision: simulatedEvaluation.decision,
        },
      };

      setAuditLogs((prev) => [newAudit, ...prev]);

      const result: SimulationRunResult = {
        scenario,
        evaluation: simulatedEvaluation,
        initialScore: initialRiskResult.overallScore,
        finalScore: finalRiskScore,
        incidentCreated: createdIncident,
        sessionsUpdated,
      };

      setLastSimulationResult(result);
      setSimulationRunning(false);

      showToast({
        type: simulatedEvaluation.decision === 'DENY' ? 'error' : 'warning',
        title: `Simulation Executed: ${scenario.title}`,
        message: `Policy Decision: ${simulatedEvaluation.decision} (Risk: ${finalRiskScore}/100)`,
      });

      return result;
    },
    [users, devices, resources, riskEngine, evaluateAccess, showToast]
  );

  // Reset to default data
  const resetToDefaultData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_devices`);
    localStorage.removeItem(`${STORAGE_KEY}_policies`);
    localStorage.removeItem(`${STORAGE_KEY}_sessions`);
    localStorage.removeItem(`${STORAGE_KEY}_incidents`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);
    localStorage.removeItem(`${STORAGE_KEY}_requests`);
    localStorage.removeItem(`${STORAGE_KEY}_config`);

    setUsers(INITIAL_USERS);
    setDevices(INITIAL_DEVICES);
    setPolicies(INITIAL_POLICIES);
    setSessions(INITIAL_SESSIONS);
    setIncidents(INITIAL_INCIDENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAccessRequests(INITIAL_ACCESS_REQUESTS);
    setRiskConfig(INITIAL_RISK_CONFIG);
    setActiveScenario(null);
    setLastSimulationResult(null);
    setSignatureActive(false);
    setSignatureStep(1);

    showToast({
      type: 'info',
      title: 'Demo Environment Reset',
      message: 'Restored all users, devices, policies, sessions, and audit records to baseline.',
    });
  }, [showToast]);

  // Signature Demo Controls
  const startSignatureDemo = useCallback(() => {
    setSignatureActive(true);
    setSignatureStep(1);
  }, []);

  const nextSignatureStep = useCallback(() => {
    setSignatureStep((prev) => {
      const next = Math.min(10, prev + 1);

      // Perform real application state transformations at key narrative steps!
      if (next === 4) {
        // Step 4: Device posture changes to compromised
        setDevices((devs) =>
          devs.map((d) =>
            d.id === 'dev-mac-03'
              ? { ...d, posture: 'Compromised', isEdrActive: false, trustScore: 18, lastVerifiedAt: new Date().toISOString() }
              : d
          )
        );
        showToast({
          type: 'warning',
          title: 'Host Sensor Alert',
          message: "Sarah's Finance MacBook Air EDR sensor terminated; posture downgraded to Compromised.",
        });
      } else if (next === 6) {
        // Step 6: Risk engine triggers and updates user risk
        setUsers((usrs) =>
          usrs.map((u) => (u.id === 'usr-003' ? { ...u, riskScore: 88 } : u))
        );
      } else if (next === 7) {
        // Step 7: Session transitions to REVOKED
        setSessions((sess) =>
          sess.map((s) =>
            s.id === 'ses-103'
              ? { ...s, state: 'Revoked', riskScore: 88, lastEvaluatedAt: new Date().toISOString() }
              : s
          )
        );
        showToast({
          type: 'error',
          title: 'Session Revocation Enforced',
          message: 'Active TLS session ses-103 severed by Zero Trust Edge PEP.',
        });
      } else if (next === 8) {
        // Step 8: Incident created
        const sigIncident: Incident = {
          id: `inc-sig-${Date.now().toString(36)}`,
          title: 'Host Compromise & Session Revocation: Sarah Chen Finance MacBook',
          severity: 'Critical',
          status: 'Investigating',
          source: 'Continuous Trust PEP',
          userId: 'usr-003',
          deviceId: 'dev-mac-03',
          resourceId: 'res-fin-vault',
          detectionTimestamp: new Date().toISOString(),
          riskScore: 88,
          assignedAnalyst: 'Marcus Vance',
          description: 'Adaptive continuous posture monitoring detected process memory injection on previously trusted endpoint. Instant policy P1 revoked live session token.',
          evidence: [
            'Endpoint posture degraded from Compliant to Compromised',
            'Policy P1 explicitly denies traffic from compromised endpoints',
            'Session ses-103 revoked within 180ms of posture degradation',
          ],
          timeline: [
            { timestamp: new Date().toISOString(), action: 'EDR heartbeat failure detected', actor: 'Host Sensor' },
            { timestamp: new Date().toISOString(), action: 'Zero Trust PEP severed session ses-103', actor: 'Policy Engine' },
          ],
        };
        setIncidents((prev) => [sigIncident, ...prev]);
      }

      return next;
    });
  }, [showToast]);

  const prevSignatureStep = useCallback(() => {
    setSignatureStep((prev) => Math.max(1, prev - 1));
  }, []);

  const resetSignatureDemo = useCallback(() => {
    resetToDefaultData();
    setSignatureActive(false);
    setSignatureStep(1);
  }, [resetToDefaultData]);

  // Identity methods
  const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt' | 'riskScore'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      riskScore: 15,
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast({ type: 'success', title: 'User Enrolled', message: `${newUser.name} added to Zero Trust directory.` });
  }, [showToast]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    showToast({ type: 'info', title: 'User Updated', message: 'Identity attributes and permissions updated.' });
  }, [showToast]);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast({ type: 'warning', title: 'User Removed', message: 'Identity removed from Zero Trust directory.' });
  }, [showToast]);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus: AccountStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  }, []);

  // Device methods
  const updateDevicePosture = useCallback((deviceId: string, posture: DevicePosture) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const newTrust = posture === 'Compromised' ? 18 : posture === 'Warning' ? 55 : 95;
          return { ...d, posture, trustScore: newTrust, lastVerifiedAt: new Date().toISOString() };
        }
        return d;
      })
    );
    showToast({
      type: posture === 'Compromised' ? 'error' : 'info',
      title: 'Device Posture Modified',
      message: `Endpoint posture updated to ${posture}.`,
    });
  }, [showToast]);

  const toggleDeviceEncryption = useCallback((deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextEncrypted = !d.isEncrypted;
          return {
            ...d,
            isEncrypted: nextEncrypted,
            trustScore: nextEncrypted ? Math.min(100, d.trustScore + 25) : Math.max(10, d.trustScore - 25),
          };
        }
        return d;
      })
    );
  }, []);

  const toggleDeviceEdr = useCallback((deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextEdr = !d.isEdrActive;
          return {
            ...d,
            isEdrActive: nextEdr,
            trustScore: nextEdr ? Math.min(100, d.trustScore + 30) : Math.max(10, d.trustScore - 30),
          };
        }
        return d;
      })
    );
  }, []);

  const toggleDevicePatch = useCallback((deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextPatch = !d.isPatchCompliant;
          return {
            ...d,
            isPatchCompliant: nextPatch,
            trustScore: nextPatch ? Math.min(100, d.trustScore + 15) : Math.max(10, d.trustScore - 15),
          };
        }
        return d;
      })
    );
  }, []);

  // Policy methods
  const addPolicy = useCallback((policyData: Omit<Policy, 'id' | 'version' | 'updatedAt'>) => {
    const newPolicy: Policy = {
      ...policyData,
      id: `pol-${Date.now().toString(36)}`,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    setPolicies((prev) => [...prev, newPolicy]);
    showToast({ type: 'success', title: 'Policy Created', message: `${newPolicy.name} activated.` });
  }, [showToast]);

  const updatePolicy = useCallback((id: string, updates: Partial<Policy>) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            version: p.version + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    showToast({ type: 'info', title: 'Policy Updated', message: 'New policy version saved and activated.' });
  }, [showToast]);

  const deletePolicy = useCallback((id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    showToast({ type: 'warning', title: 'Policy Deleted', message: 'Rule removed from evaluation pipeline.' });
  }, [showToast]);

  const togglePolicy = useCallback((id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  }, []);

  // Session methods
  const revokeSession = useCallback((sessionId: string, reason = 'Administrative manual kill switch') => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, state: 'Revoked', lastEvaluatedAt: new Date().toISOString() } : s))
    );
    showToast({ type: 'error', title: 'Session Revoked', message: `${sessionId} terminated: ${reason}` });
  }, [showToast]);

  const challengeSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, state: 'Step-up Required', stepUpRequestedAt: new Date().toISOString() } : s))
    );
    showToast({ type: 'warning', title: 'Step-up MFA Enforced', message: 'User prompted for hardware MFA re-verification.' });
  }, [showToast]);

  const restrictSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, state: 'Restricted' } : s))
    );
    showToast({ type: 'info', title: 'Session Restricted', message: 'Operations limited to read-only sandbox.' });
  }, [showToast]);

  // Incident methods
  const updateIncidentStatus = useCallback((id: string, status: Incident['status'], notes?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const newTimeline = [
            ...inc.timeline,
            {
              timestamp: new Date().toISOString(),
              action: `Incident transitioned to ${status}${notes ? `: ${notes}` : ''}`,
              actor: 'Security Analyst',
            },
          ];
          return {
            ...inc,
            status,
            resolutionNotes: notes || inc.resolutionNotes,
            timeline: newTimeline,
          };
        }
        return inc;
      })
    );
    showToast({ type: 'info', title: 'Incident Updated', message: `Status updated to ${status}.` });
  }, [showToast]);

  const isolateIncidentDevice = useCallback((incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc?.deviceId) {
      updateDevicePosture(inc.deviceId, 'Compromised');
      // Revoke any active session with this device
      setSessions((prev) =>
        prev.map((s) => (s.deviceId === inc.deviceId ? { ...s, state: 'Revoked' } : s))
      );
      showToast({
        type: 'error',
        title: 'Endpoint Isolated',
        message: `Device ${inc.deviceId} isolated from network mesh and active sessions revoked.`,
      });
    }
  }, [incidents, updateDevicePosture, showToast]);

  // Access Requests
  const createAccessRequest = useCallback((resourceId: string, justification: string, hours: number) => {
    const res = resources.find((r) => r.id === resourceId);
    const newReq: AccessRequest = {
      id: `req-jit-${Date.now().toString(36)}`,
      userId: activeUser.id,
      resourceId,
      justification,
      requestedDurationHours: hours,
      status: 'Pending',
      riskScoreAtRequest: activeUser.riskScore,
      evaluatedDecision: activeUser.riskScore > 50 ? 'DENY' : 'CHALLENGE',
      createdAt: new Date().toISOString(),
    };
    setAccessRequests((prev) => [newReq, ...prev]);
    showToast({
      type: 'info',
      title: 'JIT Request Submitted',
      message: `Elevation request for ${res?.name || resourceId} pending analyst review.`,
    });
  }, [activeUser, resources, showToast]);

  const approveAccessRequest = useCallback((id: string) => {
    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'Approved', decidedAt: new Date().toISOString(), decidedBy: activeUser.name }
          : r
      )
    );
    showToast({ type: 'success', title: 'Access Request Approved', message: 'Ephemeral access granted for duration.' });
  }, [activeUser, showToast]);

  const rejectAccessRequest = useCallback((id: string) => {
    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'Rejected', decidedAt: new Date().toISOString(), decidedBy: activeUser.name }
          : r
      )
    );
    showToast({ type: 'warning', title: 'Access Request Rejected', message: 'Request denied by policy reviewer.' });
  }, [activeUser, showToast]);

  const updateRiskConfig = useCallback((newConfig: RiskConfig) => {
    setRiskConfig(newConfig);
    showToast({ type: 'success', title: 'Risk Config Updated', message: 'New risk weights and thresholds applied.' });
  }, [showToast]);

  const setActiveUserById = useCallback((userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setActiveUserId(userId);
      setActiveRole(found.role);
    }
  }, [users]);

  return (
    <ZeroTrustContext.Provider
      value={{
        users,
        devices,
        resources,
        policies,
        sessions,
        incidents,
        auditLogs,
        accessRequests,
        riskConfig,
        activeRole,
        activeUser,
        simulationScenarios: SIMULATION_SCENARIOS,
        activeScenario,
        simulationRunning,
        lastSimulationResult,
        toasts,
        signatureActive,
        signatureStep,
        riskEngine,
        policyEngine,
        postureScore,
        activeSessionsCount,
        privilegedSessionsCount,
        highRiskIdentitiesCount,
        policyViolationsCount,
        setActiveRole,
        setActiveUserById,
        showToast,
        removeToast,
        evaluateAccess,
        runSimulation,
        resetToDefaultData,
        startSignatureDemo,
        nextSignatureStep,
        prevSignatureStep,
        resetSignatureDemo,
        setSignatureStep,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        updateDevicePosture,
        toggleDeviceEncryption,
        toggleDeviceEdr,
        toggleDevicePatch,
        addPolicy,
        updatePolicy,
        deletePolicy,
        togglePolicy,
        revokeSession,
        challengeSession,
        restrictSession,
        updateIncidentStatus,
        isolateIncidentDevice,
        createAccessRequest,
        approveAccessRequest,
        rejectAccessRequest,
        updateRiskConfig,
      }}
    >
      {children}
    </ZeroTrustContext.Provider>
  );
};

export const useZeroTrust = () => {
  const context = useContext(ZeroTrustContext);
  if (!context) {
    throw new Error('useZeroTrust must be used within a ZeroTrustProvider');
  }
  return context;
};
