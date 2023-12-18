import { getUserSubscriptionPlan } from "@/lib/stripe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { Icons } from "./Icons";
import Link from "next/link";
import { Gem, LogOut } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";

interface UserAccNavProps {
  email: string | undefined;
  imageUrl: string;
  name: string;
}

const UserAccNav = async ({ email, imageUrl, name }: UserAccNavProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400">
          <Avatar className="relative w-8 h-8">
            {imageUrl ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  src={imageUrl}
                  alt={"profile"}
                  fill
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <Icons.user className="h-4 w-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="font-medium text-zinc-700 w-[200px] truncate text-xs">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-300" />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="mt-0.5">
          {subscriptionPlan.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">
              Upgrade <Gem className="ml-2 h-4 w-4 text-primary" />
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-300" />

        <DropdownMenuItem className="flex justify-center gap-1.5 text-zinc-900 text-sm items-center font-semibold">
          <LogoutLink>Logout</LogoutLink>
          <LogOut className="h-4 w-4 text-zinc-900 mt-0.5" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccNav;
