import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginRequest, parseUnknownError } from "../features/auth/api";
import { AuthLayout } from "../features/auth/AuthLayout";
import { PasswordToggle } from "../features/auth/PasswordToggle";
import { usePasswordVisible } from "../features/auth/usePasswordVisible";
import { loginFormSchema, type LoginFormValues } from "../features/auth/schemas";
import { getSession, goToCrm, goToMarketplace } from "../features/auth/session";

export function LoginPage() {
  const password = usePasswordVisible();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (result) => {
      if (result.staff) {
        goToCrm();
        return;
      }
      goToMarketplace();
    },
  });

  useEffect(() => {
    document.title = "Anmelden — NN-Finanzberatung";
    if (getSession()) goToMarketplace();
  }, []);

  const banner = form.formState.errors.email?.message
    || form.formState.errors.password?.message
    || (mutation.isError ? parseUnknownError(mutation.error, "Anmeldung nicht möglich.") : "");

  return (
    <AuthLayout>
      <main className="auth">
        <div className="auth-card">
          <span className="badge">
            <span className="dot" />
            Mandantenkonto
          </span>
          <h1>Anmelden</h1>
          <p className="lead">Melden Sie sich an, um den Marktplatz zu öffnen.</p>
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => {
              mutation.reset();
              mutation.mutate(values);
            })}
          >
            {banner ? <p className="auth-error">{banner}</p> : <p className="auth-error" hidden />}
            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                {...form.register("email")}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Passwort</label>
              <div className="pw-wrap">
                <input id="password" type={password.inputType} autoComplete="off" {...form.register("password")} />
                <PasswordToggle show={password.show} onToggle={password.toggle} />
              </div>
            </div>
            <button className="auth-submit" type="submit" disabled={mutation.isPending}>
              Anmelden
            </button>
          </form>
          <p className="auth-switch">
            Noch kein Konto? <Link to="/signup">Konto eröffnen</Link>
          </p>
        </div>
      </main>
    </AuthLayout>
  );
}
