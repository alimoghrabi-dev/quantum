import React from "react";
import MaxWidthRapper from "./MaxWidthRapper";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccNav from "./UserAccNav";
import MovieNav from "./MovieNav";

export default async function Navbar() {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  return (
    <nav className="sticky h-14 inset-x-0 px-4 top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-lg transition-all">
      <MaxWidthRapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link
            href="/"
            className="flex z-40 text-lg font-semibold items-center gap-x-2">
            <Image src="/logo.png" alt="logo" width={22} height={22} />
            Quantum.
          </Link>

          <div className="flex items-center space-x-4">
            {!user ? (
              <div className="hidden sm:flex">
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}>
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}>
                  Sign in
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                    className: "text-base font-medium",
                  })}>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </RegisterLink>
              </div>
            ) : (
              <>
                <UserAccNav
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                />
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    size: "sm",
                    className: "sm:flex items-center hidden",
                  })}>
                  Dashboard
                </Link>
              </>
            )}

            {!user ? <MovieNav isAuth={!!user} /> : null}
          </div>
        </div>
      </MaxWidthRapper>
    </nav>
  );
}
