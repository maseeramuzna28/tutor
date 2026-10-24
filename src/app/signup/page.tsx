import AuthPageView from "@/components/Auth/AuthPageView";

export const metadata = {
  title: "Create an account — TUTO",
  description: "Create an account on TUTO.",
};

export default function SignupPage() {
  return <AuthPageView mode="signup" />;
}
