const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const u = await p.user.count();
  const q = await p.question.count();
  const s = await p.subject.count();
  console.log('users=' + u + ' questions=' + q + ' subjects=' + s);
  const st = await p.user.findUnique({ where: { email: 'student@onthi2029.vn' } });
  console.log('student exists:', !!st);
  await p.$disconnect();
})();