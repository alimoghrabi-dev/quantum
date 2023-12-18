"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

const UpgradeButton = () => {
  const router = useRouter();
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      router.push(url ?? "/dashboard/billing");
    },
  });

  return (
    <Button
      className="w-full flex items-center"
      onClick={() => createStripeSession()}>
      Upgrade Now
      <ArrowRight className="ml-2 h-5 w-5 mt-0.5" />
    </Button>
  );
};

export default UpgradeButton;
