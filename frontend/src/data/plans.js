// Available subscription plans
export const PLANS = {
  // Free Plan
  free: {
    id: "free",
    label: "Free",
    price: 0,
    taskLimit: 5,
    color: "secondary",

    features: [
      "Up to 5 tasks",
      "Basic task management",
      "Collaboration requests",
    ],
  },

  // Pro Plan
  pro: {
    id: "pro",
    label: "Pro",
    price: 9,
    taskLimit: 50,
    color: "primary",

    features: [
      "Up to 50 tasks",
      "TaskPilot AI coach",
      "Priority support",
      "Task analytics",
    ],
  },

  // Ultimate Plan
  ultimate: {
    id: "ultimate",
    label: "Ultimate",
    price: 29,
    taskLimit: Infinity,
    color: "success",

    features: [
      "Unlimited tasks",
      "Everything in Pro",
      "Unlimited collaborators",
      "Team activity log",
    ],
  },
};

// Order in which plans should be displayed
export const PLAN_ORDER = ["free", "pro", "ultimate"];

// Get plan details
export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

// Get task limit for a plan
export function getTaskLimit(planId) {
  return getPlan(planId).taskLimit;
}

// Check whether the user has reached the task limit
export function isAtTaskLimit(planId, currentTaskCount) {
  const limit = getTaskLimit(planId);

  return limit !== Infinity && currentTaskCount >= limit;
}

// Format task limit for display
export function formatLimit(planId) {
  const limit = getTaskLimit(planId);

  return limit === Infinity ? "Unlimited" : limit;
}