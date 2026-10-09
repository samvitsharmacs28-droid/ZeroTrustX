import {
  User,
  Device,
  ProtectedResource,
  RiskConfig,
  RiskEvaluationResult,
  RiskLevel,
  RiskSignal,
  PolicyAction,
} from '../types';

export interface RiskInputContext {
  user: User;
  device?: Device;
  resource?: ProtectedResource;
  location?: string;
  speedKmh?: number;
  failedAttempts?: number;
  isOffHours?: boolean;
  suspiciousActivityFlag?: boolean;
  suspiciousActivityDetail?: string;
  overrideDevicePosture?: Device['posture'];
}

export class RiskEngine {
  private config: RiskConfig;

  constructor(config: RiskConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: RiskConfig) {
    this.config = newConfig;
  }

  public getConfig(): RiskConfig {
    return this.config;
  }

  public evaluateRisk(context: RiskInputContext): RiskEvaluationResult {
    const {
      user,
      device,
      resource,
      location = user.currentLocation || user.locationBaseline,
      speedKmh = 0,
      failedAttempts = 0,
      isOffHours = false,
      suspiciousActivityFlag = false,
      suspiciousActivityDetail,
      overrideDevicePosture,
    } = context;

    const signals: RiskSignal[] = [];

    // 1. Identity Verification Signal
    let identityScore = 0;
    let identityDesc = 'Identity verified active with standard lifecycle state.';
    if (user.status === 'Dormant') {
      identityScore = 90;
      identityDesc = 'Account has been dormant (>90 days inactive); elevated takeover likelihood.';
    } else if (user.status === 'Suspended') {
      identityScore = 95;
      identityDesc = 'Account is administratively suspended.';
    } else if (user.status === 'Pending Review') {
      identityScore = 40;
      identityDesc = 'Account is awaiting background verification review.';
    }
    signals.push({
      id: 'sig-identity',
      name: 'Identity Verification Status',
      category: 'Identity',
      score: identityScore,
      weight: this.config.weights.identityVerification,
      weightedScore: identityScore * this.config.weights.identityVerification,
      description: identityDesc,
      rawValue: user.status,
      mitigationTip: 'Verify identity credentials and reactivate through HR approval flow.',
    });

    // 2. MFA Strength Signal
    let mfaScore = 0;
    let mfaDesc = 'Hardware-backed FIDO2 / WebAuthn token verified (Phishing-resistant).';
    if (!user.mfaEnrolled || user.mfaMethod === 'NONE') {
      mfaScore = 95;
      mfaDesc = 'No multi-factor authentication enrolled.';
    } else if (user.mfaMethod === 'SMS_OTP') {
      mfaScore = 55;
      mfaDesc = 'SMS OTP utilized (susceptible to SIM swapping and interception).';
    } else if (user.mfaMethod === 'AUTHENTICATOR_APP') {
      mfaScore = 20;
      mfaDesc = 'Software TOTP Authenticator app (moderately secure, not hardware-bound).';
    } else if (user.mfaMethod === 'FIDO2_HARDWARE_KEY') {
      mfaScore = 0;
      mfaDesc = 'FIDO2 / WebAuthn cryptographic hardware token verified.';
    }
    signals.push({
      id: 'sig-mfa',
      name: 'MFA Authentication Strength',
      category: 'Authentication',
      score: mfaScore,
      weight: this.config.weights.mfaStrength,
      weightedScore: mfaScore * this.config.weights.mfaStrength,
      description: mfaDesc,
      rawValue: user.mfaMethod,
      mitigationTip: 'Prompt user for step-up hardware token or WebAuthn biometric prompt.',
    });

    // 3. Device Posture Signal
    let deviceScore = 50;
    let deviceDesc = 'No registered endpoint device bound to session.';
    const effectivePosture = overrideDevicePosture || (device ? device.posture : 'Unknown');

    if (device) {
      if (effectivePosture === 'Compromised' || device.isJailbroken) {
        deviceScore = 98;
        deviceDesc = 'Endpoint identified as Compromised: EDR disabled, rooted or infected.';
      } else if (effectivePosture === 'Warning') {
        deviceScore = 55;
        deviceDesc = 'Endpoint exhibits warning posture: patch overdue or missing telemetry.';
      } else if (!device.isEncrypted) {
        deviceScore = 65;
        deviceDesc = 'Device local storage / FileVault is unencrypted.';
      } else if (!device.isEdrActive) {
        deviceScore = 60;
        deviceDesc = 'Endpoint Detection and Response (EDR) agent is non-responsive.';
      } else if (device.trustScore >= 90) {
        deviceScore = 5;
        deviceDesc = `Corporate managed device healthy (Trust Score: ${device.trustScore}/100, Disk Encrypted, EDR active).`;
      } else {
        deviceScore = 100 - device.trustScore;
        deviceDesc = `Device trust score reported at ${device.trustScore}/100.`;
      }
    }
    signals.push({
      id: 'sig-device',
      name: 'Device Security Posture',
      category: 'Device',
      score: deviceScore,
      weight: this.config.weights.devicePosture,
      weightedScore: deviceScore * this.config.weights.devicePosture,
      description: deviceDesc,
      rawValue: effectivePosture,
      mitigationTip: 'Require endpoint patch compliance or isolate host via EDR.',
    });

    // 4. Unusual Location / Baseline Deviation
    let locationScore = 5;
    let locationDesc = `Origin matches user historical baseline (${user.locationBaseline}).`;
    if (location && user.locationBaseline && location !== user.locationBaseline) {
      const isKnownProxy = location.includes('Tor') || location.includes('Kyiv') || location.includes('Bucharest');
      if (isKnownProxy) {
        locationScore = 88;
        locationDesc = `Origin (${location}) resolves to unapproved proxy or high-risk geographic autonomous system.`;
      } else {
        locationScore = 48;
        locationDesc = `Access origin (${location}) differs from established baseline (${user.locationBaseline}).`;
      }
    }
    signals.push({
      id: 'sig-location',
      name: 'Location & Network Baseline',
      category: 'Location',
      score: locationScore,
      weight: this.config.weights.locationAnomaly,
      weightedScore: locationScore * this.config.weights.locationAnomaly,
      description: locationDesc,
      rawValue: location,
      mitigationTip: 'Challenge user with geographic out-of-band push confirmation.',
    });

    // 5. Impossible Travel
    let travelScore = 0;
    let travelDesc = 'No physical displacement anomaly detected.';
    if (speedKmh > 800) {
      travelScore = 95;
      travelDesc = `Impossible travel detected: displacement calculated at ${Math.round(speedKmh)} km/h across recent checkpoints.`;
    } else if (speedKmh > 300) {
      travelScore = 40;
      travelDesc = `High-speed displacement detected (${Math.round(speedKmh)} km/h), possible flight or cellular handoff.`;
    }
    signals.push({
      id: 'sig-travel',
      name: 'Velocity & Impossible Travel',
      category: 'Location',
      score: travelScore,
      weight: this.config.weights.impossibleTravel,
      weightedScore: travelScore * this.config.weights.impossibleTravel,
      description: travelDesc,
      rawValue: `${Math.round(speedKmh)} km/h`,
      mitigationTip: 'Invalidate active tokens across conflicting geographic origins.',
    });

    // 6. Access Time Window
    let timeScore = 5;
    let timeDesc = 'Request falls within standard regional business operating hours.';
    if (isOffHours) {
      timeScore = 45;
      timeDesc = 'Request submitted during atypical off-hours (02:00 - 05:00 local).';
    }
    signals.push({
      id: 'sig-time',
      name: 'Access Time Window',
      category: 'Behavior',
      score: timeScore,
      weight: this.config.weights.unusualTime,
      weightedScore: timeScore * this.config.weights.unusualTime,
      description: timeDesc,
      rawValue: isOffHours ? 'Off-Hours' : 'Business Hours',
      mitigationTip: 'Enforce step-up approval for non-standard hour execution.',
    });

    // 7. Failed Authentication Attempts
    let failedScore = 0;
    let failedDesc = 'Clean authentication history; 0 recent failed attempts.';
    if (failedAttempts >= 5) {
      failedScore = 95;
      failedDesc = `${failedAttempts} consecutive failed attempts detected within 5-minute rolling window.`;
    } else if (failedAttempts >= 2) {
      failedScore = 50;
      failedDesc = `${failedAttempts} failed authentication challenges recorded recently.`;
    }
    signals.push({
      id: 'sig-failed',
      name: 'Failed Authentication Velocity',
      category: 'Authentication',
      score: failedScore,
      weight: this.config.weights.failedAttempts,
      weightedScore: failedScore * this.config.weights.failedAttempts,
      description: failedDesc,
      rawValue: failedAttempts,
      mitigationTip: 'Trigger exponential backoff delay and temporary account lockout.',
    });

    // 8. Resource Sensitivity
    let resourceScore = 20;
    let resourceDesc = 'Target resource classified as Standard Internal.';
    if (resource) {
      if (resource.sensitivity === 'Restricted_PCI') {
        resourceScore = 90;
        resourceDesc = 'Target resource is Tier 0 Crown Jewel (Customer PCI Vault / Production IAM).';
      } else if (resource.sensitivity === 'Confidential') {
        resourceScore = 65;
        resourceDesc = 'Target resource contains Confidential financial, intellectual, or HR assets.';
      } else if (resource.sensitivity === 'Public') {
        resourceScore = 5;
        resourceDesc = 'Target resource has Public classification.';
      }
    }
    signals.push({
      id: 'sig-resource',
      name: 'Target Resource Sensitivity',
      category: 'Resource',
      score: resourceScore,
      weight: this.config.weights.resourceSensitivity,
      weightedScore: resourceScore * this.config.weights.resourceSensitivity,
      description: resourceDesc,
      rawValue: resource ? resource.sensitivity : 'Unspecified',
      mitigationTip: 'Confirm user role possesses explicit data classification entitlement.',
    });

    // 9. Privilege Level & Excessive Privileges
    let privScore = 15;
    let privDesc = `User holds standard ${user.role} role without anomalous entitlement grant.`;
    if (user.role === 'Contractor' && resource?.sensitivity === 'Restricted_PCI') {
      privScore = 95;
      privDesc = 'Contractor identity attempting out-of-scope access to PCI Crown Jewel.';
    } else if (user.excessivePrivileges) {
      privScore = 60;
      privDesc = 'Identity flagged during quarterly audit for excessive standing privileges.';
    } else if (user.role === 'Administrator') {
      privScore = 35;
      privDesc = 'Privileged Administrator account (elevated blast radius upon compromise).';
    }
    signals.push({
      id: 'sig-privilege',
      name: 'Privilege Level & Entitlement Scope',
      category: 'Identity',
      score: privScore,
      weight: this.config.weights.privilegeLevel,
      weightedScore: privScore * this.config.weights.privilegeLevel,
      description: privDesc,
      rawValue: user.role,
      mitigationTip: 'Enforce Just-In-Time (JIT) ephemeral role elevation.',
    });

    // 10. Suspicious Session Activity
    let activityScore = 0;
    let activityDesc = 'Session telemetry exhibits normal interactive human behavior.';
    if (suspiciousActivityFlag) {
      activityScore = 92;
      activityDesc = suspiciousActivityDetail || 'Suspicious automated activity or memory injection detected.';
    }
    signals.push({
      id: 'sig-activity',
      name: 'Behavioral & In-Session Telemetry',
      category: 'Behavior',
      score: activityScore,
      weight: this.config.weights.suspiciousActivity,
      weightedScore: activityScore * this.config.weights.suspiciousActivity,
      description: activityDesc,
      rawValue: suspiciousActivityFlag ? 'Anomaly Detected' : 'Nominal',
      mitigationTip: 'Immediately terminate connection and capture memory forensic dump.',
    });

    // Calculate total weighted score
    const totalWeights = signals.reduce((sum, s) => sum + s.weight, 0);
    const totalWeightedScore = signals.reduce((sum, s) => sum + s.weightedScore, 0);
    const normalizedRawScore = totalWeights > 0 ? totalWeightedScore / totalWeights : 0;

    // Hard ceiling triggers: if critical indicator occurs (e.g. impossible travel, compromised endpoint),
    // ensure the score reflects high/critical severity so security cannot be bypassed.
    let finalScore = Math.round(normalizedRawScore);
    if (effectivePosture === 'Compromised') {
      finalScore = Math.max(finalScore, 85);
    }
    if (speedKmh > 800) {
      finalScore = Math.max(finalScore, 82);
    }
    if (user.status === 'Dormant' && resource?.sensitivity !== 'Public') {
      finalScore = Math.max(finalScore, 80);
    }

    // Classify
    let classification: RiskLevel = 'Low';
    let recommendedAction: PolicyAction = 'ALLOW';

    const { lowMax, mediumMax, highMax } = this.config.thresholds;

    if (finalScore <= lowMax) {
      classification = 'Low';
      recommendedAction = 'ALLOW';
    } else if (finalScore <= mediumMax) {
      classification = 'Medium';
      recommendedAction = 'CHALLENGE';
    } else if (finalScore <= highMax) {
      classification = 'High';
      recommendedAction = 'RESTRICT';
    } else {
      classification = 'Critical';
      recommendedAction = 'DENY';
    }

    const formulaSnapshot = `Score = Σ(Signal_i × Weight_i) / Σ(Weight_i) = ${totalWeightedScore.toFixed(2)} / ${totalWeights.toFixed(2)} = ${finalScore}/100`;

    // Explainable reasoning synthesis
    const topElevatedSignals = [...signals]
      .filter((s) => s.score > 40)
      .sort((a, b) => b.weightedScore - a.weightedScore);

    let explanation = '';
    if (topElevatedSignals.length === 0) {
      explanation = `Risk is rated ${classification} (${finalScore}/100). All telemetry signals fall within corporate baseline parameters. Access recommended with standard monitoring.`;
    } else {
      const topNames = topElevatedSignals.slice(0, 2).map((s) => `${s.name} (${s.score}/100)`).join(' and ');
      explanation = `Risk elevated to ${classification} (${finalScore}/100) primarily driven by ${topNames}. Recommended operational action is ${recommendedAction}.`;
    }

    return {
      overallScore: finalScore,
      classification,
      signals,
      recommendedAction,
      explanation,
      calculationTimestamp: new Date().toISOString(),
      formulaSnapshot,
    };
  }
}
