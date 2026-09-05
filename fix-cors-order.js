const fs = require('fs');
const content = fs.readFileSync('backend/worker/index.ts', 'utf-8');

const authMiddleware = `app.use('/api/*', async (c, next) => {
  const publicPath = ['/api/auth/login', '/api/auth/register', '/api/auth/bootstrap-admin', '/api/auth/send-otp', '/api/auth/login-id'].includes(new URL(c.req.url).pathname);
  if (publicPath) return next();
  const authorization = c.req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) return c.json({ success: false, error: 'Authentication required' }, 401);
  try {
    const user = await readToken(authorization.slice(7), c.env.AUTH_SECRET);
    if (!user) return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    c.set('user', user);
    return next();
  } catch {
    return c.json({ success: false, error: 'Invalid authentication token' }, 401);
  }
});`;

const corsMiddleware = `app.use('/api/*', async (c, next) => {
  const origin = c.req.header('origin');
  const allowed = (c.env.CORS_ORIGINS || '').split(',').map(value => value.trim());
  if (origin && (allowed.includes('*') || allowed.includes(origin) || origin.endsWith('.royalsync-frontend.pages.dev'))) c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Bootstrap-Token');
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (c.req.method === 'OPTIONS') return c.body(null, 204);
  return next();
});`;

if (content.indexOf(authMiddleware) < content.indexOf(corsMiddleware)) {
  console.log("Swapping middlewares");
  let newContent = content.replace(authMiddleware, '___AUTH___').replace(corsMiddleware, authMiddleware).replace('___AUTH___', corsMiddleware);
  fs.writeFileSync('backend/worker/index.ts', newContent);
} else {
  console.log("Already swapped or not found exactly");
}
