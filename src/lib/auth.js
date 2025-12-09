import { compare } from 'bcryptjs';
import prisma from './prisma';

export async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

export async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}
