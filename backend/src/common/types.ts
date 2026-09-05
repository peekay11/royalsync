// Shared Hono types for the RoyalSync API.
// AppUser is the decoded JWT payload attached to the request context by the
// `authenticate` middleware and read across controllers via `c.get('user')`.

export interface AppUser {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

// Hono context variables available on every authenticated request.
export type AppEnv = {
  Variables: {
    user: AppUser;
  };
};
