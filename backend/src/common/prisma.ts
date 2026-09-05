import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export function getTenantPrisma(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const m = model as any;
          if (['Tenant'].includes(m)) return query(args); // don't filter tenant table itself

          // Models that have tenantId
          if (['User'].includes(m)) {
            const currentArgs = (args || {}) as any;
            currentArgs.where = { ...currentArgs.where, tenantId };
            return query(currentArgs);
          }
          return query(args);
        },
      },
    },
  });
}
