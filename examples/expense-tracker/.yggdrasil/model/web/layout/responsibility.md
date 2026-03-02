# Layout — Responsibility

Header with navigation, user dropdown, logout. ProtectedRoute: redirects to /login when no token. Wraps all authenticated pages.

Not responsible for: auth logic (AuthContext), page content.
