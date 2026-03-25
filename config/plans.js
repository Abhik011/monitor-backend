const PLANS = {

  FREE: {
    key: "FREE",
    name: "Free",
    price: 0,

    limits: {
      events: 10000,
      projects: 1,
      retentionDays: 7
    },

    features: {
      errorTracking: true,
      apiMonitoring: true,
      sessionTracking: false,
      realTimeAlerts: false,
      advancedAnalytics: false,
      teamMembers: false,
      sso: false,
      prioritySupport: false
    }
  },

  STARTUP: {
    key: "STARTUP",
    name: "Startup",
    price: 799,

    limits: {
      events: 100000,
      projects: 5,
      retentionDays: 30
    },

    features: {
      errorTracking: true,
      apiMonitoring: true,
      sessionTracking: true,
      realTimeAlerts: true,
      advancedAnalytics: false,
      teamMembers: false,
      sso: false,
      prioritySupport: false
    }
  },

  GROWTH: {
    key: "GROWTH",
    name: "Growth",
    price: 2499,

    limits: {
      events: 1000000,
      projects: 20,
      retentionDays: 90
    },

    features: {
      errorTracking: true,
      apiMonitoring: true,
      sessionTracking: true,
      realTimeAlerts: true,
      advancedAnalytics: true,
      teamMembers: true,
      sso: false,
      prioritySupport: false
    }
  },

  BUSINESS: {
    key: "BUSINESS",
    name: "Business",
    price: 8999,

    limits: {
      events: 10000000,
      projects: -1, // unlimited
      retentionDays: 365
    },

    features: {
      errorTracking: true,
      apiMonitoring: true,
      sessionTracking: true,
      realTimeAlerts: true,
      advancedAnalytics: true,
      teamMembers: true,
      sso: true,
      prioritySupport: true
    }
  }

};

module.exports = PLANS;