import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcrypt';

interface RolePermissionData {
  roleId: number;
  permissionId: number;
}

async function main() {
  console.log('🚀 Starting database seeding...');

  // 1. Create roles
  await prisma.role.createMany({
    data: [{ name: 'EMPLOYEE' }, { name: 'REVIEWER' }, { name: 'ASSIGNEE' }, { name: 'ADMIN' }],
    skipDuplicates: true,
  });
  console.log('✅ Roles created successfully');

  // 2. Create permissions
  await prisma.permission.createMany({
    data: [
      { name: 'ticket:create' },
      { name: 'ticket:view' },
      { name: 'ticket:update' },
      { name: 'ticket:status-change' },
      { name: 'ticket:priority-change' },
      { name: 'ticket:reassign' },
      { name: 'chat:create' },
      { name: 'chat:view' },
      { name: 'assignee:view' },
      { name: 'admin:view' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Permissions created successfully');

  // 3. Fetch roles + permissions
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  const employeeRole = roles.find(r => r.name === 'EMPLOYEE');
  const assigneeRole = roles.find(r => r.name === 'ASSIGNEE');
  const adminRole = roles.find(r => r.name === 'ADMIN');

  if (!employeeRole || !assigneeRole || !adminRole)
    throw new Error('Missing employee / assignee / admin role');

  const rolePermissionsData: RolePermissionData[] = [];

  // Employee permissions
  const employeePermissions = [
    'ticket:create',
    'ticket:view',
    'ticket:update',
    'ticket:status-change',
    'chat:create',
    'chat:view',
  ];

  employeePermissions.forEach(permName => {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      rolePermissionsData.push({
        roleId: employeeRole.id,
        permissionId: permission.id,
      });
    }
  });

  // Assignee permissions
  const assigneePermissions = [
    'ticket:create',
    'ticket:view',
    'ticket:status-change',
    'ticket:priority-change',
    'ticket:reassign',
    'chat:create',
    'chat:view',
    'assignee:view',
  ];

  assigneePermissions.forEach(permName => {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      rolePermissionsData.push({
        roleId: assigneeRole.id,
        permissionId: permission.id,
      });
    }
  });

  // ADMIN PERMISSIONS (No Create Ticket)
const adminPermissions = [
  'ticket:reassign',
  'chat:view',
  'assignee:view',
  'admin:view',
  'ticket:view',
];

  adminPermissions.forEach(name => {
    const perm = permissions.find(p => p.name === name);
    if (perm) rolePermissionsData.push({ roleId: adminRole.id, permissionId: perm.id });
  });

  await prisma.rolePermission.createMany({
    data: rolePermissionsData,
    skipDuplicates: true,
  });
  console.log('✅ Role permissions created successfully');

  // 4. Departments
  const departments = await prisma.department.createMany({
    data: [
      { name: 'IT' },
      { name: 'HR/Accounts' },
      { name: 'Engineering' },
      { name: 'DevOps' },
      { name: 'IT(Hardware/Admin)' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ ${departments.count} Departments created successfully`);

  // 5. Fetch departments
  const departmentsList = await prisma.department.findMany();
  const itDept = departmentsList.find(d => d.name === 'IT');

  if (!itDept) throw new Error('IT Department Missing');

  // 6. Password Hashing
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 7. Create Assignee User
  const user = await prisma.user.upsert({
    where: { email: 'asignee@gmail.com' },
    update: {
      password: hashedPassword,
      roleId: assigneeRole.id,
      departmentId: itDept.id,
    },
    create: {
      name: 'John Doe',
      email: 'assignee@gmail.com',
      password: hashedPassword,
      roleId: assigneeRole.id,
      departmentId: itDept.id,
    },
  });
  console.log('✅ User created/updated:', user);

  // 8. Create Assignee record
  await prisma.assignee.create({
    data: {
      userId: user.id,
      departmentId: itDept.id,
      isDefault: true,
    },
  });
  console.log('✅ Assignee created');

  // 9. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: hashedPassword,
      roleId: adminRole.id,
      departmentId: itDept.id,
    },
    create: {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      roleId: adminRole.id,
      departmentId: itDept.id,
    },
  });

  console.log('✅ Admin user created:', adminUser);

  // 10. Ticket number generator
  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  };

  // 11. Create Sample Tickets
  // 11. Create Sample Tickets (5 tickets)
  const tickets = await prisma.ticket.createMany({
    data: [
      {
        userId: user.id,
        ticketNumber: generateTicketNumber(),
        departmentId: itDept.id,
        assetType: 'Hardware',
        assetId: 'AS-010',
        issueType: 'Keyboard Issue',
        title: 'Keyboard keys not working',
        description: 'Some keys on the keyboard have stopped responding.',
        attachments: [],
      },
      {
        userId: user.id,
        ticketNumber: generateTicketNumber(),
        departmentId: itDept.id,
        assetType: 'Software',
        assetId: 'SW-555',
        issueType: 'Outlook Email Sync',
        title: 'Emails not syncing in Outlook',
        description: 'Outlook is not receiving or sending emails since morning.',
        attachments: ['error-screenshot.jpg'],
      },
    ],
  });

  console.log(`✅ ${tickets.count} Sample Tickets created successfully`);

  // 12. Common Issues
  const commonIssues = await prisma.commonIssue.createMany({
    data: [
      { title: 'Laptop not booting', description: 'Boot issue', departmentId: itDept.id },
      { title: 'Wi-Fi not connecting', description: 'WiFi issue', departmentId: itDept.id },
      { title: 'Email not syncing', description: 'Mail sync issue', departmentId: itDept.id },
      {
        title: 'Software installation request',
        description: 'Install issue',
        departmentId: itDept.id,
      },
      { title: 'System performance issue', description: 'Slow system', departmentId: itDept.id },
      { title: 'VPN connection failed', description: 'VPN error', departmentId: itDept.id },
      { title: 'Printer not responding', description: 'Printer offline', departmentId: itDept.id },
      { title: 'Display issue', description: 'Monitor issue', departmentId: itDept.id },
      { title: 'Keyboard malfunction', description: 'Keyboard issue', departmentId: itDept.id },
      { title: 'Account locked', description: 'Password reset needed', departmentId: itDept.id },
      { title: 'Laptop Running Slow', description: 'Performance issue', departmentId: itDept.id },
      { title: 'Headphones Not Working', description: 'Audio jack issue', departmentId: itDept.id },
      { title: 'Smartflo Not Working', description: 'App issue', departmentId: itDept.id },
      { title: 'Smartflo Audio Issue', description: 'Mic issue', departmentId: itDept.id },
      { title: 'Internet Not Working', description: 'Internet down', departmentId: itDept.id },
      { title: 'Wi-Fi Not Working', description: 'Network issue', departmentId: itDept.id },
      { title: 'Mouse Not Working', description: 'Mouse failure', departmentId: itDept.id },
    ],
  });

  console.log(`✅ ${commonIssues.count} Common Issues created successfully`);

  console.log('🎉 Seeding completed successfully!');
}

// Run seeder
main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
