import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicHome } from "../pages/PublicHome";

const LoginPage = lazy(() => import("../pages/Login").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("../pages/Signup").then((m) => ({ default: m.SignupPage })));
const AccountRedirect = lazy(() => import("../pages/AccountRedirect").then((m) => ({ default: m.AccountRedirect })));

/**
 * Route guards here are UX only. Authorization is enforced by server.py.
 * /app.html and /crm stay on the Python static site until those slices.
 */
export function AppRouter() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

  return (
    <BrowserRouter basename={basename === "" ? undefined : basename}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login.html" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup.html" element={<Navigate to="/signup" replace />} />
          <Route path="/account" element={<AccountRedirect />} />
          <Route path="/account.html" element={<Navigate to="/account" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
