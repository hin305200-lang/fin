import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { parseUnknownError, signupRequest } from "../features/auth/api";
import { AuthLayout } from "../features/auth/AuthLayout";
import { PasswordToggle } from "../features/auth/PasswordToggle";
import { usePasswordVisible } from "../features/auth/usePasswordVisible";
import { signupFormSchema, type SignupFormValues } from "../features/auth/schemas";
import { getSession, goToMarketplace } from "../features/auth/session";

export function SignupPage() {
  const password = usePasswordVisible();
  const confirm = usePasswordVisible();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirm: "" },
  });
  const mutation = useMutation({
    mutationFn: signupRequest,
    onSuccess: () => {
      goToMarketplace();
    },
  });

  useEffect(() => {
    document.title = "Konto eröffnen — NN-Finanzberatung";
    if (getSession()) goToMarketplace();
  }, []);

  const firstError =
    form.formState.errors.name?.message
    || form.formState.errors.email?.message
    || form.formState.errors.password?.message
    || form.formState.errors.confirm?.message
    || (mutation.isError ? parseUnknownError(mutation.error, "Konto konnte nicht erstellt werden.") : "");

  return (
    <AuthLayout>
      <main className="auth">
        <div className="auth-card">
          <span className="badge">
            <span className="dot" />
            Mandantenkonto
          </span>
          <h1>Konto eröffnen</h1>
          <p className="lead">Ein Konto. Danach der Marktplatz: Tagesgeld, Festgeld und ETF-Portfolios bei Partnerbanken.</p>
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => {
              mutation.reset();
              mutation.mutate(values);
            })}
          >
            {firstError ? <p className="auth-error">{firstError}</p> : <p className="auth-error" hidden />}
            <div className="field">
              <label htmlFor="name">Vollständiger Name</label>
              <input id="name" type="text" autoComplete="name" {...form.register("name")} />
            </div>
            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input id="email" type="email" autoComplete="email" {...form.register("email")} />
            </div>
            <div className="field">
              <label htmlFor="phone">
                Telefon <span style={{ color: "var(--mut)", fontWeight: 500 }}>(optional)</span>
              </label>
              <input id="phone" type="tel" autoComplete="tel" {...form.register("phone")} />
            </div>
            <div className="field">
              <label htmlFor="password">Passwort</label>
              <div className="pw-wrap">
                <input id="password" type={password.inputType} autoComplete="new-password" {...form.register("password")} />
                <PasswordToggle show={password.show} onToggle={password.toggle} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="confirm">Passwort bestätigen</label>
              <div className="pw-wrap">
                <input id="confirm" type={confirm.inputType} autoComplete="new-password" {...form.register("confirm")} />
                <PasswordToggle show={confirm.show} onToggle={confirm.toggle} />
              </div>
            </div>
            <button className="auth-submit" type="submit" disabled={mutation.isPending}>
              Konto erstellen
            </button>
          </form>
          <p className="auth-switch">
            Bereits ein Konto? <Link to="/login">Anmelden</Link>
          </p>
        </div>
      </main>
    </AuthLayout>
  );
}
