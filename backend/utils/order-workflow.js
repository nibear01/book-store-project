// backend/utils/order-workflow.js
// Central definition of internal order workflow transitions and role access

export const WORKFLOW_TRANSITIONS = {
  OM_INTAKE: ["CSM_ADDRESS_CHECK", "TERMINATED_OM"],
  CSM_ADDRESS_CHECK: ["CSM_CLARIFIED", "CANCELLED_CSM"],
  CSM_CLARIFIED: ["FM_REVIEW", "CANCELLED_CSM"],
  FM_REVIEW: ["FM_APPROVED", "FM_REJECTED", "CANCELLED_FM"],
  FM_APPROVED: ["PM_QUEUE"],
  PM_QUEUE: ["PM_PREP"],
  PM_PREP: ["PM_RUN"],
  PM_RUN: ["PM_FINISH"],
  PM_FINISH: ["DM_QUEUE"],
  DM_QUEUE: ["DM_PACKING"],
  DM_PACKING: ["DM_IN_TRANSIT"],
  DM_IN_TRANSIT: ["DM_OUT_FOR_DELIVERY"],
  DM_OUT_FOR_DELIVERY: ["DM_DELIVERED"],
  DM_DELIVERED: ["CSM_FEEDBACK"],
  CSM_FEEDBACK: ["OM_COMPLETED"],
  // Terminal: OM_COMPLETED, TERMINATED_OM, CANCELLED_CSM, CANCELLED_FM, FM_REJECTED
};

export const ROLE_STAGE_SCOPE = {
  order_manager: ["OM_INTAKE", "TERMINATED_OM", "OM_COMPLETED"],
  customer_support: [
    "CSM_ADDRESS_CHECK",
    "CSM_CLARIFIED",
    "CSM_FEEDBACK",
    "CANCELLED_CSM",
  ],
  finance_manager: ["FM_REVIEW", "FM_APPROVED", "FM_REJECTED", "CANCELLED_FM"],
  printing_manager: ["PM_QUEUE", "PM_PREP", "PM_RUN", "PM_FINISH"],
  delivery_manager: [
    "DM_QUEUE",
    "DM_PACKING",
    "DM_IN_TRANSIT",
    "DM_OUT_FOR_DELIVERY",
    "DM_DELIVERED",
  ],
  admin: ["*"],
};

export const TERMINAL_STAGES = [
  "OM_COMPLETED",
  "TERMINATED_OM",
  "CANCELLED_CSM",
  "CANCELLED_FM",
  "FM_REJECTED",
];

export function canTransition({ current, target, userRoles }) {
  const nexts = WORKFLOW_TRANSITIONS[current] || [];
  if (!nexts.includes(target)) return false;
  if (userRoles.includes("admin")) return true;
  return userRoles.some((r) => {
    const scope = ROLE_STAGE_SCOPE[r];
    if (!scope) return false;
    return (
      scope.includes("*") || scope.includes(current) || scope.includes(target)
    );
  });
}

export function nextStages(current, userRoles) {
  const all = WORKFLOW_TRANSITIONS[current] || [];
  if (userRoles.includes("admin")) return all;
  return all.filter((target) => canTransition({ current, target, userRoles }));
}

export function stageVisibleToRoles(stage, userRoles) {
  // An order in a given stage should be visible only to admin + role responsible for that stage
  if (userRoles.includes("admin")) return true;
  // Enhancement: order_manager requested to have global visibility across all stages
  if (userRoles.includes("order_manager")) return true;
  if (userRoles.includes("customer_support")) return true;
  if (userRoles.includes("finance_manager")) return true;
  if (userRoles.includes("printing_manager")) return true;
  if (userRoles.includes("delivery_manager")) return true;
  // Reverse-map stage -> responsible role
  for (const [role, stages] of Object.entries(ROLE_STAGE_SCOPE)) {
    if (role === "admin") continue;
    if (stages.includes(stage)) {
      return userRoles.includes(role);
    }
  }
  // Terminal stages: allow visibility to whoever handled previously? Keep strict = false => hidden
  return false;
}
