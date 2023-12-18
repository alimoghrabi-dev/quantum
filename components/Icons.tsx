import { LucideProps, User } from "lucide-react";
import Image from "next/image";

export const Icons = {
  user: User,
  logo: (props: LucideProps) => (
    <Image src="/logo.png" alt="logo" width={18} height={18} />
  ),
};
