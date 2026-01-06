import { prisma } from '../../../utils/prisma';
import type { AdminTicketStats } from '../../../types/admin';
import { TicketStatus } from '../../../generated/prisma/client';
import logger from '../../../utils/logger';

/**
 * Admin Dashboard Summary
 */
// export const getAdminDashboardStats = async (): Promise<
//   AdminTicketStats & { openTickets: number }
// > => {
//   logger.info('Fetching admin dashboard summary stats');

//   const [total, resolved, pending, open] = await Promise.all([
//     prisma.ticket.count(),

//     prisma.ticket.count({
//       where: { status: TicketStatus.CLOSED }, // Changed from DONE to CLOSED
//     }),

//     prisma.ticket.count({
//       where: { status: TicketStatus.PENDING },
//     }),

//     prisma.ticket.count({
//       where: {
//         OR: [{ status: TicketStatus.OPEN }, { status: TicketStatus.INPROGRESS }],
//       },
//     }),
//   ]);

//   logger.info('Dashboard stats fetched successfully');

//   return {
//     totalTickets: total,
//     resolvedTickets: resolved,
//     pendingTickets: pending,
//     openTickets: open,
//   };
// };
/**
 * Admin Ticket graphical stats
 */
// export const getMonthlyStats = async () => {
//   logger.info('Fetching monthly ticket statistics');

//   const currentYear = new Date().getFullYear();
//   const lastYear = currentYear - 1;

//   const monthNames = [
//     'Jan',
//     'Feb',
//     'Mar',
//     'Apr',
//     'May',
//     'Jun',
//     'Jul',
//     'Aug',
//     'Sep',
//     'Oct',
//     'Nov',
//     'Dec',
//   ];

//   const thisYearTickets = await prisma.ticket.findMany({
//     where: {
//       createdAt: {
//         gte: new Date(`${currentYear}-01-01`),
//         lte: new Date(`${currentYear}-12-31`),
//       },
//     },
//     select: { createdAt: true },
//   });

//   const lastYearTickets = await prisma.ticket.findMany({
//     where: {
//       createdAt: {
//         gte: new Date(`${lastYear}-01-01`),
//         lte: new Date(`${lastYear}-12-31`),
//       },
//     },
//     select: { createdAt: true },
//   });

//   const thisYear = Array(12).fill(0);
//   const lastYearArr = Array(12).fill(0);

//   thisYearTickets.forEach(t => thisYear[t.createdAt.getMonth()]++);
//   lastYearTickets.forEach(t => lastYearArr[t.createdAt.getMonth()]++);

//   logger.info('Monthly ticket stats fetched successfully');

//   return {
//     thisYear: monthNames.map((m, i) => ({ month: m, ticketCount: thisYear[i] })),
//     lastYear: monthNames.map((m, i) => ({ month: m, ticketCount: lastYearArr[i] })),
//   };
// };

/**
 * ADMIN — Get All Departments With Resolvers (Assignees) + Reviewers
 */
export const getAdminDepartments = async (
  page: number,
  limit: number,
  search?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
) => {
  logger.info('Fetching departments for Admin Manage Dept Page');

  const skip = (page - 1) * limit;

  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};

  // Define valid sort fields with proper typing
  type SortField = 'id' | 'name' | 'createdAt' | 'updatedAt';
  const sortFieldMap: Record<string, SortField> = {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  };

  // Default to createdAt if invalid sort field provided
  const validSortField: SortField = sortFieldMap[sortBy] || 'createdAt';

  const departments = await prisma.department.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [validSortField]: sortOrder },
    include: {
      assignee: {
        select: {
          id: true,
          isDefault: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      reviewers: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      DepartmentManager: true,
    },
  });

  const enriched = await Promise.all(
    departments.map(async dept => {
      const defaultReviewerSetting = await prisma.settings.findUnique({
        where: {
          key: `default_reviewer_${dept.id}`,
        },
      });

      const defaultReviewerId = defaultReviewerSetting
        ? Number(defaultReviewerSetting.value)
        : null;

      return {
        id: dept.id,
        name: dept.name,
        isActive: dept.DepartmentManager?.[0]?.isActive ?? true,
        createdAt: dept.createdAt, // Add this field to response
        updatedAt: dept.updatedAt, // Add this field to response
        assignee: dept.assignee.map(a => ({
          ...a,
          isDefault: Boolean(a.isDefault),
        })),
        reviewers: dept.reviewers.map(rev => ({
          ...rev,
          isDefault: rev.user.id === defaultReviewerId,
        })),
      };
    }),
  );

  const totalDepartments = await prisma.department.count({ where });

  return {
    totalDepartments,
    departments: enriched,
  };
};

/**
 * ADMIN — Get All Assignees for dropdown
 */
export const getAllAssigneeForDept = async () => {
  logger.info('Fetching all assignee for Admin Dept Page');

  return prisma.user.findMany({
    where: { role: { is: { name: 'ASSIGNEE' } }, isActive: true },
    select: { id: true, name: true, email: true },
  });
};

/**
 * ADMIN — Create New Department with assignees
 */
export const createAdminDepartment = async (
  name: string,
  defaultAssigneeId: number,
  assignees: number[],
) => {
  logger.info(`Admin creating new department: ${name}`);

  // Validate department name (case-insensitive)
  const existingDept = await prisma.department.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (existingDept) {
    throw new Error('Department with this name already exists');
  }

  // Create department
  const department = await prisma.department.create({
    data: { name },
  });

  // Save assignees
  await prisma.assignee.createMany({
    data: assignees.map(uid => ({
      userId: uid,
      departmentId: department.id,
      isDefault: uid === defaultAssigneeId,
    })),
  });

  return department;
};


// UPDATE
export const updateAdminDepartment = async (
  id: number,
  name?: string,
  defaultAssigneeId?: number,
  assignees?: number[],
  defaultReviewerId?: number,
) => {
  const existingDept = await prisma.department.findUnique({
    where: { id },
  });

  if (!existingDept) {
    throw new Error('Department not found.');
  }

  // Validate NAME (case insensitive)
  if (name) {
    const dupeCheck = await prisma.department.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        NOT: { id },
      },
    });

    if (dupeCheck) {
      throw new Error(`Department '${name}' already exists.`);
    }

    await prisma.department.update({
      where: { id },
      data: { name },
    });
  }

  // Validate assignees + defaultAssignee
  if (Array.isArray(assignees)) {
    if (assignees.length === 0) {
      throw new Error('Assignees list cannot be empty.');
    }

    if (defaultAssigneeId && !assignees.includes(defaultAssigneeId)) {
      throw new Error('defaultAssigneeId must be inside assignees array.');
    }

    await prisma.assignee.deleteMany({ where: { departmentId: id } });

    await prisma.assignee.createMany({
      data: assignees.map(uid => ({
        userId: uid,
        departmentId: id,
        isDefault: uid === defaultAssigneeId,
      })),
    });
  }

  // Default Reviewer
  if (defaultReviewerId) {
    // validate user exists
    const reviewerUser = await prisma.user.findUnique({
      where: { id: defaultReviewerId },
    });

    if (!reviewerUser) {
      throw new Error('Default reviewer user does not exist.');
    }

    // remove old reviewers
    await prisma.reviewer.deleteMany({ where: { departmentId: id } });

    // add only 1 reviewer
    await prisma.reviewer.create({
      data: {
        userId: defaultReviewerId,
        departmentId: id,
      },
    });

    await prisma.settings.upsert({
      where: { key: `default_reviewer_${id}` },
      update: { value: String(defaultReviewerId) },
      create: { key: `default_reviewer_${id}`, value: String(defaultReviewerId) },
    });
  }

  return { id, name: name ?? existingDept.name };
};

// TOGGLE ACTIVE/INACTIVE STATUS
export const toggleDepartmentActivation = async (id: number) => {
  // Check if department has tickets
  const ticketCount = await prisma.ticket.count({
    where: { departmentId: id },
  });
  if (ticketCount > 0) {
    throw new Error(
      'Cannot deactivate this department because tickets already exist in this department.',
    );
  }

  let manager = await prisma.departmentManager.findFirst({
    where: { departmentId: id },
  });

  if (!manager) {
    manager = await prisma.departmentManager.create({
      data: {
        departmentId: id,
        userId: 1,
        isActive: false,
      },
    });
    return manager;
  }

  const updated = await prisma.departmentManager.update({
    where: { id: manager.id },
    data: { isActive: !manager.isActive },
  });

  return updated;
};
