import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Genera un hash seguro para una contraseña.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña escrita por el usuario
 * contra un hash almacenado en MongoDB.
 */
export async function comparePassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
