"use client";

import Loading from "@/app/components/loading";
import LoginPageForm from "@/app/components/loginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginPageForm />
    </Suspense>
  );
}
