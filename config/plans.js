const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    events: 10000,
    projects: 1,
    retention: 7,
    features: [
      "10k events / month",
      "1 project",
      "7 day retention",
      "Error tracking",
      "API monitoring"
    ]
  },

  STARTUP: {
    name: "Startup",
    price: 799,
    events: 100000,
    projects: 5,
    retention: 30,
    features: [
      "100k events / month",
      "5 projects",
      "30 day retention",
      "Real-time alerts",
      "Session tracking"
    ]
  },

  GROWTH: {
    name: "Growth",
    price: 2499,
    events: 1000000,
    projects: 20,
    retention: 90,
    features: [
      "1M events / month",
      "20 projects",
      "90 day retention",
      "Advanced analytics",
      "Team members"
    ]
  },

  BUSINESS: {
    name: "Business",
    price: 8999,
    events: 10000000,
    projects: Infinity,
    retention: 365,
    features: [
      "10M events / month",
      "Unlimited projects",
      "1 year retention",
      "SSO login",
      "Priority support"
    ]
  }
};

module.exports = PLANS;