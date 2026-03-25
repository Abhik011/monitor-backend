const FEATURES = {

  /* -----------------------------
     CORE MONITORING
  ----------------------------- */

  errorTracking: {
    name: "Error Tracking",
    description: "Capture JavaScript and backend errors",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  apiMonitoring: {
    name: "API Monitoring",
    description: "Monitor API requests and failures",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  performanceMonitoring: {
    name: "Performance Monitoring",
    description: "Track page load and latency metrics",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  webVitals: {
    name: "Core Web Vitals",
    description: "LCP, CLS, INP tracking",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  resourceMonitoring: {
    name: "Resource Performance",
    description: "Track JS, CSS, images loading time",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  sessionTracking: {
    name: "Session Tracking",
    description: "Analyze user sessions and activity",
    plans: ["STARTUP", "GROWTH", "BUSINESS"]
  },

  rageClicks: {
    name: "Rage Click Detection",
    description: "Detect user frustration clicks",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  /* -----------------------------
     RELIABILITY
  ----------------------------- */

  uptimeMonitoring: {
    name: "Uptime Monitoring",
    description: "Monitor endpoint availability",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  incidentTracking: {
    name: "Incident Tracking",
    description: "Automatic incident detection",
    plans: ["FREE", "STARTUP", "GROWTH", "BUSINESS"]
  },

  alerts: {
    name: "Real-time Alerts",
    description: "Email / webhook alerts",
    plans: ["STARTUP", "GROWTH", "BUSINESS"]
  },

  multiRegionMonitoring: {
    name: "Multi Region Monitoring",
    description: "Check uptime from multiple regions",
    plans: ["GROWTH", "BUSINESS"]
  },

  /* -----------------------------
     ANALYTICS
  ----------------------------- */

  errorGrouping: {
    name: "Error Grouping",
    description: "Group errors by fingerprint",
    plans: ["STARTUP", "GROWTH", "BUSINESS"]
  },

  advancedAnalytics: {
    name: "Advanced Analytics",
    description: "Detailed performance insights",
    plans: ["GROWTH", "BUSINESS"]
  },

  countryAnalytics: {
    name: "Country Analytics",
    description: "Error stats by country",
    plans: ["STARTUP", "GROWTH", "BUSINESS"]
  },

  userSessions: {
    name: "User Sessions",
    description: "User journey tracking",
    plans: ["STARTUP", "GROWTH", "BUSINESS"]
  },

  /* -----------------------------
     COLLABORATION
  ----------------------------- */

  teamMembers: {
    name: "Team Members",
    description: "Invite team members",
    plans: ["GROWTH", "BUSINESS"]
  },

  rolePermissions: {
    name: "Role Permissions",
    description: "Admin / developer roles",
    plans: ["BUSINESS"]
  },

  /* -----------------------------
     ENTERPRISE
  ----------------------------- */

  ssoLogin: {
    name: "SSO Login",
    description: "Single sign-on authentication",
    plans: ["BUSINESS"]
  },

  auditLogs: {
    name: "Audit Logs",
    description: "Track security actions",
    plans: ["BUSINESS"]
  },

  prioritySupport: {
    name: "Priority Support",
    description: "Dedicated support",
    plans: ["BUSINESS"]
  }

};

module.exports = FEATURES;