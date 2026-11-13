"use client";
/**
 * A01 — Sign In page
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Landmark, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email:      z.string().email("Enter a valid email address"),
  password:   z.string().min(6, "Password is required"),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState<string | null>(null);

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email:    data.email,
        password: data.password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Check your credentials.";
      setServerError(msg === "Invalid login credentials" ? "Invalid email or password." : msg);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-midnight)" }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,56,245,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Landmark size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-[#6338F5] transition-colors">
              ANAGU<span className="text-[#6338F5]">!</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-[#AAB4CC]">Secure · Transparent · Trusted</p>
        </div>

        {/* Card */}
        <div className="card">
          <h1 className="text-xl font-bold text-white mb-1">Sign in to your account</h1>
          <p className="text-sm text-[#AAB4CC] mb-6">
            New to ANAGU?{" "}
            <Link href="/register" className="text-[#6338F5] hover:underline font-medium">
              Create account
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#EF4444]" role="alert">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#6338F5] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB4CC] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#EF4444]" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                {...register("rememberMe")}
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-[#29345A] bg-[#111832] accent-[#6338F5]"
              />
              <label htmlFor="rememberMe" className="text-sm text-[#AAB4CC] cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-2 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 p-3">
                <AlertCircle size={16} className="text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-sm text-[#EF4444]">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm"
            >
              {isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#AAB4CC]">
          By signing in, you agree to ANAGU&apos;s{" "}
          <span className="text-[#6338F5]">Terms of Use</span> and{" "}
          <span className="text-[#6338F5]">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
