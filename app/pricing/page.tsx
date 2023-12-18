import MaxWidthRapper from "@/components/MaxWidthRapper";
import UpgradeButton from "@/components/UpgradeButton";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { plans } from "@/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRightIcon, Check, HelpCircle, MinusIcon } from "lucide-react";
import Link from "next/link";

const pricingItems = [
  {
    plan: "Free",
    tagline: "For small side projects.",
    quota: 10,
    features: [
      {
        text: "5 pages per PDF",
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: "4MB file size limit",
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
        negative: true,
      },
      {
        text: "Priority support",
        negative: true,
      },
    ],
  },
  {
    plan: "Pro",
    tagline: "For larger projects with higher needs.",
    quota: plans.find((p) => p.slug === "pro")!.quota,
    features: [
      {
        text: "50 pages per PDF",
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: "32MB file size limit",
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
      },
      {
        text: "Priority support",
      },
    ],
  },
];

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <MaxWidthRapper className="mb-8 mt-24 text-center max-w-5xl">
        <div className="mx-auto mb-10 max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            {
              "Wether you're just trying out our survice or need more, we've got you covered."
            }
          </p>
        </div>
        <div className="pt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 pl-8 sm:pl-0">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price =
                plans.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount || 0;

              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-primary shadow-primary/50": plan === "Pro",
                    "border border-gray-300 shadow-gray-600/50": plan !== "Pro",
                  })}>
                  {plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-primary">
                      Upgrade Now
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="my-3 text-center font-display text-3xl font-bold">
                      {plan}
                    </h3>
                    <p className="text-gray-500">{tagline}</p>
                    <p className="my-5 font-display text-6xl font-semibold">
                      ${price}
                    </p>
                    <p className="text-gray-500">for lifetime</p>
                  </div>
                  <div className="flex h-20 items-center justify-center border-b border-t borer-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <p>
                        {quota.toLocaleString()} Max {"PDF's"}
                      </p>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                          <HelpCircle className="h-4 w-4 text-zinc-600" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          How many {"PDF's"} you can upload.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className="flex space-x-5">
                        <div className="flex-shrink-0">
                          {negative ? (
                            <MinusIcon className="h-6 w-6 text-gray-400" />
                          ) : (
                            <Check className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        {footnote ? (
                          <div className="flex items-center space-x-1">
                            <p
                              className={cn("text-gray-400", {
                                "text-gray-600": negative,
                              })}>
                              {text}
                            </p>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="cursor-default ml-1.5">
                                <HelpCircle className="h-4 w-4 text-zinc-600" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p
                            className={cn("text-gray-400", {
                              "text-gray-600": negative,
                            })}>
                            {text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200">
                    <div className="p-5">
                      {plan === "Free" ? (
                        <Link
                          href={user ? "/dashboard" : "/sign-in"}
                          className={cn(
                            buttonVariants({
                              className: "w-full flex",
                              variant: "secondary",
                            })
                          )}>
                          {user ? "Upgrade Now" : "Sign Up"}
                          <ArrowRightIcon className="ml-2 h-5 w-5 mt-0.5" />
                        </Link>
                      ) : user ? (
                        <UpgradeButton />
                      ) : (
                        <Link
                          href="/sign-in"
                          className={cn(
                            buttonVariants({
                              className: "w-full",
                            })
                          )}>
                          {user ? "Upgrade Now" : "Sign Up"}
                          <ArrowRightIcon className="ml-1.5 h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthRapper>
    </>
  );
};

export default Page;
