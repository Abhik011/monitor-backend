const FEATURES = require("../config/features");
const PLANS = require("../config/plans");

/* --------------------------------
   CHECK FEATURE ACCESS
-------------------------------- */

function hasFeature(plan, featureKey){

  const feature = FEATURES[featureKey];

  if(!feature) return false;

  return feature.plans.includes(plan);

}

/* --------------------------------
   GET PLAN LIMIT
-------------------------------- */

function getPlanLimit(plan, key){

  const planConfig = PLANS[plan];

  if(!planConfig) return null;

  return planConfig[key];

}

/* --------------------------------
   CHECK EVENT LIMIT
-------------------------------- */

function checkEventLimit(org){

  if(!org || !org.plan) return false;

  const plan = PLANS[org.plan];

  if(!plan) return false;

  if(plan.events === -1) return true;

  return org.usage.events < plan.events;

}

/* --------------------------------
   CHECK PROJECT LIMIT
-------------------------------- */

function checkProjectLimit(org, projectCount){

  if(!org || !org.plan) return false;

  const plan = PLANS[org.plan];

  if(!plan) return false;

  if(plan.projects === -1) return true;

  return projectCount < plan.projects;

}

/* --------------------------------
   CHECK MONITOR LIMIT
-------------------------------- */

function checkMonitorLimit(planKey, monitorCount){

  const plan = PLANS[planKey];

  if(!plan) return false;

  if(plan.monitors === -1) return true;

  return monitorCount < plan.monitors;

}

module.exports = {
  hasFeature,
  getPlanLimit,
  checkEventLimit,
  checkProjectLimit,
  checkMonitorLimit
};