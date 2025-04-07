"use client";

import Loading from "@/app/components/loading";
import SignupPageForm from "@/app/components/signUpForm";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupPageForm />
    </Suspense>
  );
}
