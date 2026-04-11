/**
 * Serializes a Prisma BigInt value to a number for safe JSON transmission.
 * Returns null if the value is null or undefined.
 */
export function serializeBigInt(value: bigint | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

/**
 * Recursively serializes an object that may contain BigInt values from Prisma.
 * Converts all BigInt properties to numbers.
 */
export function serializePrismaPayload<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  ) as T;
}
