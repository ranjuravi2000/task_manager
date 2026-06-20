export const PLANS = {
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

export const PLAN_ORDER = ["free", "pro", "ultimate"];

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function getTaskLimit(planId) {
  return getPlan(planId).taskLimit;
}

export function isAtTaskLimit(planId, currentTaskCount) {
  const limit = getTaskLimit(planId);
  return limit !== Infinity && currentTaskCount >= limit;
}

export function formatLimit(planId) {
  const limit = getTaskLimit(planId);
  return limit === Infinity ? "Unlimited" : limit;
}