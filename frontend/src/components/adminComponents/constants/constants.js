// Centralized constants & helpers for workflow modules

export const STAGE_SETS = {
  FINANCE: ['FM_REVIEW','FM_APPROVED','FM_REJECTED','CANCELLED_FM'],
  PRINTING: ['PM_QUEUE','PM_PREP','PM_RUN','PM_FINISH'],
  DELIVERY: ['DM_QUEUE','DM_PACKING','DM_IN_TRANSIT','DM_OUT_FOR_DELIVERY','DM_DELIVERED'],
  SUPPORT: ['CSM_ADDRESS_CHECK','CSM_CLARIFIED','CSM_FEEDBACK','CANCELLED_CSM']
};

export const REMARK_REQUIRED = {
  FINANCE: new Set(['FM_REJECTED','CANCELLED_FM']),
  SUPPORT: new Set(['CANCELLED_CSM']),
  PRINTING: new Set([]),
  DELIVERY: new Set([])
};

export function normalizeRoles(activeRole, roles) {
  const raw = Array.isArray(roles) ? roles : [activeRole].filter(Boolean);
  return raw
    .filter(Boolean)
    .map(r => String(r).trim().toLowerCase())
    .filter((r,i,a) => a.indexOf(r) === i);
}

export function paginate(list, page, pageSize) {
  const start = (page - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

export const DEFAULT_PAGE_SIZE = 10;
