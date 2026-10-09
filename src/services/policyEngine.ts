import {
  User,
  Device,
  ProtectedResource,
  Policy,
  PolicyAction,
  PolicyEvaluationResult,
  RiskEvaluationResult,
} from '../types';

export interface PolicyEvaluationInput {
  user: User;
  device?: Device;
  resource?: ProtectedResource;
  riskResult: RiskEvaluationResult;
  policies: Policy[];
  location?: string;
  speedKmh?: number;
}

export class PolicyEngine {
  public evaluate(input: PolicyEvaluationInput): PolicyEvaluationResult {
    const { user, device, resource, riskResult, policies, location, speedKmh = 0 } = input;
    const correlationId = `ztx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    // 1. Sort policies by priority ascending (1 is highest priority)
    const activePolicies = policies
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    // Default fail-safe fallback
    if (activePolicies.length === 0) {
      return {
        decision: 'DENY',
        matchedPolicyId: null,
        matchedPolicyName: 'Default Zero Trust Fail-Secure Deny',
        evidence: ['No active Zero Trust policies configured in system.'],
        riskResult,
        humanExplanation: 'Request denied by default. No matching active policies were found in the rule table.',
        remediation: 'Configure and enable an appropriate Zero Trust access policy for this resource.',
        correlationId,
        timestamp,
      };
    }

    // 2. Iterate through ordered policies
    for (const policy of activePolicies) {
      const matchDetails = this.checkPolicyMatch(policy, user, device, resource, riskResult, location, speedKmh);
      if (matchDetails.isMatch) {
        // Matched rule found!
        const humanExplanation = this.formatExplanation(policy, matchDetails.evidence, riskResult);
        const remediation = this.getRemediationForAction(policy.action, matchDetails.evidence, user, device, resource);

        return {
          decision: policy.action,
          matchedPolicyId: policy.id,
          matchedPolicyName: policy.name,
          evidence: matchDetails.evidence,
          riskResult,
          humanExplanation,
          remediation,
          correlationId,
          timestamp,
        };
      }
    }

    // Fallback if no specific rule matched
    return {
      decision: 'DENY',
      matchedPolicyId: 'pol-fallback',
      matchedPolicyName: 'Catch-All Default Deny',
      evidence: [
        'No explicit grant policy satisfied all identity, device posture, and risk constraints.',
        `Evaluated risk score: ${riskResult.overallScore}/100.`,
      ],
      riskResult,
      humanExplanation: 'Request denied by Zero Trust default-deny architecture. The request failed to satisfy the criteria of any permissive policy.',
      remediation: 'Review required entitlements, satisfy minimum device compliance scores, or submit a Just-In-Time access request.',
      correlationId,
      timestamp,
    };
  }

  private checkPolicyMatch(
    policy: Policy,
    user: User,
    device: Device | undefined,
    resource: ProtectedResource | undefined,
    riskResult: RiskEvaluationResult,
    location?: string,
    speedKmh = 0
  ): { isMatch: boolean; evidence: string[] } {
    const evidence: string[] = [];

    // Target roles match
    const roleMatches =
      policy.targetRoles.includes('*' as any) ||
      policy.targetRoles.includes(user.role);
    if (!roleMatches) {
      return { isMatch: false, evidence: [] };
    }

    // Target resources match
    const resourceMatches =
      policy.targetResources.includes('*') ||
      (resource && policy.targetResources.includes(resource.id));
    if (!resourceMatches) {
      return { isMatch: false, evidence: [] };
    }

    const { conditions } = policy;

    // Condition 1: Block Dormant Accounts
    if (conditions.blockDormantAccounts) {
      if (user.status === 'Dormant' || user.status === 'Suspended') {
        evidence.push(`Account status is '${user.status}' (inactive for >90 days or suspended).`);
        return { isMatch: true, evidence };
      }
      return { isMatch: false, evidence: [] };
    }

    // Condition 2: Block if Impossible Travel
    if (conditions.blockIfImpossibleTravel) {
      if (speedKmh > 800) {
        evidence.push(`Physically impossible velocity detected: ${Math.round(speedKmh)} km/h between locations.`);
        return { isMatch: true, evidence };
      }
      const isKnownBlockedLocation = location && (location.includes('Tor') || location.includes('Kyiv'));
      if (isKnownBlockedLocation) {
        evidence.push(`Origin network flagged as unapproved proxy or suspicious IP location (${location}).`);
        return { isMatch: true, evidence };
      }
      if (riskResult.overallScore >= 80) {
        evidence.push(`Risk score (${riskResult.overallScore}/100) exceeded maximum threshold for policy.`);
        return { isMatch: true, evidence };
      }
      return { isMatch: false, evidence: [] };
    }

    // Condition 3: Require Compliant Device / Min Device Trust Score
    if (conditions.requireCompliantDevice) {
      const isDeviceCompromised = !device || device.posture === 'Compromised' || device.isJailbroken;
      if (isDeviceCompromised) {
        evidence.push(`Device posture is '${device?.posture || 'Unknown'}' with root/jailbreak or missing security controls.`);
        return { isMatch: true, evidence };
      }
      if (conditions.minDeviceTrustScore && device.trustScore < conditions.minDeviceTrustScore) {
        evidence.push(`Device trust score (${device.trustScore}/100) is below required ${conditions.minDeviceTrustScore}/100.`);
        return { isMatch: true, evidence };
      }
      // If policy action is DENY, we only match if condition was violated!
      if (policy.action === 'DENY') {
        return { isMatch: false, evidence: [] };
      }
    }

    // Condition 4: Max Risk Score (for ALLOW / RESTRICT / CHALLENGE)
    if (conditions.maxRiskScore !== undefined) {
      if (policy.action === 'ALLOW') {
        if (riskResult.overallScore > conditions.maxRiskScore) {
          return { isMatch: false, evidence: [] }; // Cannot allow if score too high
        }
        evidence.push(`Overall risk score (${riskResult.overallScore}/100) satisfies threshold (<= ${conditions.maxRiskScore}).`);
      } else if (policy.action === 'CHALLENGE') {
        // Challenge applies if resource is high security or MFA is needed
        if (conditions.requireMfa && user.mfaMethod !== 'FIDO2_HARDWARE_KEY') {
          evidence.push(`Phishing-resistant FIDO2 hardware MFA required. Current method is '${user.mfaMethod}'.`);
          return { isMatch: true, evidence };
        }
      }
    }

    // Condition 5: Minimum Device Trust Score
    if (conditions.minDeviceTrustScore !== undefined) {
      if (policy.action === 'ALLOW' || policy.action === 'RESTRICT') {
        if (!device || device.trustScore < conditions.minDeviceTrustScore) {
          return { isMatch: false, evidence: [] };
        }
        evidence.push(`Device trust score (${device.trustScore}/100) meets minimum of ${conditions.minDeviceTrustScore}/100.`);
      }
    }

    // Condition 6: Contractor specific check
    if (policy.action === 'RESTRICT' && user.role === 'Contractor') {
      evidence.push('Contractor role bound to least-privilege restricted operational scope.');
      return { isMatch: true, evidence };
    }

    // If it's a general ALLOW baseline rule
    if (policy.action === 'ALLOW') {
      evidence.push(`Identity role '${user.role}' and health checks passed baseline policy conditions.`);
      return { isMatch: true, evidence };
    }

    // If policy has no specific condition constraints and matches role + resource
    return { isMatch: true, evidence };
  }

  private formatExplanation(policy: Policy, evidence: string[], riskResult: RiskEvaluationResult): string {
    switch (policy.action) {
      case 'DENY':
        return `Explicit DENY enforced by policy '${policy.name}'. Reasons: ${evidence.join(' ')}`;
      case 'CHALLENGE':
        return `Step-up authentication required by policy '${policy.name}'. Reasons: ${evidence.join(' ')}`;
      case 'RESTRICT':
        return `Access permitted with restricted least-privilege sandbox by '${policy.name}'. Reasons: ${evidence.join(' ')}`;
      case 'ALLOW':
        return `Access GRANTED by policy '${policy.name}'. Identity, device trust, and calculated risk (${riskResult.overallScore}/100) satisfied all access criteria.`;
    }
  }

  private getRemediationForAction(
    action: PolicyAction,
    evidence: string[],
    user: User,
    device?: Device,
    resource?: ProtectedResource
  ): string {
    switch (action) {
      case 'DENY':
        if (device?.posture === 'Compromised') {
          return 'Isolate device immediately. Run endpoint antivirus/EDR deep scan, remediate detected threats, and verify disk encryption.';
        }
        if (user.status === 'Dormant') {
          return 'Submit an identity reactivation ticket via the Security Operations Helpdesk to verify current employment and project status.';
        }
        return 'Verify credentials, connect through approved corporate network gateways, and ensure compliant device posture.';
      case 'CHALLENGE':
        return 'Insert your FIDO2 Security Key or approve the biometric authentication prompt on your enrolled authenticator.';
      case 'RESTRICT':
        return 'If elevated permissions are required, submit an emergency Just-In-Time (JIT) access request with valid business justification.';
      case 'ALLOW':
        return 'No remediation necessary. Continuous session monitoring active.';
    }
  }
}
