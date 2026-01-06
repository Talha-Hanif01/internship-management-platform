import { AppDataSource } from '../data-source';
import { User } from '../users/user.entity';
import { UserRole } from '@shared/roles';
import * as bcrypt from 'bcrypt';

async function main() {
  await AppDataSource.initialize();

  const email = 'superadmin@test.com';
  const password = await bcrypt.hash('SuperSecret123!', 10); // initial random password

  const existing = await AppDataSource.manager.findOne(User, {
    where: { email },
  });

  if (existing) {
    console.log('Super Admin already exists.');
    return;
  }

  const superAdmin = AppDataSource.manager.create(User, {
    email,
    password,
    role: UserRole.SUPER_ADMIN,
  });

  await AppDataSource.manager.save(superAdmin);

  console.log('Super Admin created:', {
    email: superAdmin.email,
    password: 'SuperSecret123!',
  });

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
