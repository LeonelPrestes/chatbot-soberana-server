const SOFT_DELETE_MODELS = new Set([
  'User', 'Specialty', 'Clinic', 'Procedure', 'ClinicCosts', 'Pricing',
  'PricingItem', 'Conversation', 'Message', 'PricingAudit',
])

const READ_OPERATIONS = new Set([
  'findMany', 'findFirst', 'findFirstOrThrow', 'findUnique',
  'findUniqueOrThrow', 'count', 'aggregate', 'groupBy',
])

export function scopeSoftDeletedQuery<T extends object>(
  model: string | undefined,
  operation: string,
  args: T,
): T {
  if (!model || !SOFT_DELETE_MODELS.has(model) || !READ_OPERATIONS.has(operation)) {
    return args
  }

  const current = args as Record<string, unknown>
  const where = (current.where ?? {}) as Record<string, unknown>
  if (Object.hasOwn(where, 'deletedAt')) return args

  return { ...current, where: { ...where, deletedAt: null } } as T
}
