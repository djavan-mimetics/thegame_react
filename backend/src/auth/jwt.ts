import { SignJWT, jwtVerify } from 'jose';

export type AccessTokenPayload = {
  sub: string;
};

export async function signAccessToken(input: {
  secret: string;
  userId: string;
  ttlSeconds: number;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const secretBytes = new TextEncoder().encode(input.secret);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + input.ttlSeconds)
    .setSubject(input.userId)
    .sign(secretBytes);
}

export async function verifyAccessToken(input: {
  secret: string;
  token: string;
}): Promise<AccessTokenPayload> {
  const secretBytes = new TextEncoder().encode(input.secret);
  const { payload } = await jwtVerify(input.token, secretBytes);
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new Error('invalid_token');
  }
  return { sub: payload.sub };
}
