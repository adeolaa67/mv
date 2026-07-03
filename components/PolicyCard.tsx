import { PolicyCard as PolicyCardType } from "@/lib/types";
import { CardIcon, ClockIcon, RefundIcon, CalendarIcon } from "./icons";

const policyIcons = {
  card: CardIcon,
  clock: ClockIcon,
  refund: RefundIcon,
  calendar: CalendarIcon,
};

export default function PolicyCard({ icon, title, body }: PolicyCardType) {
  const Icon = policyIcons[icon];

  return (
    <div className="border border-hairline px-6 py-8 text-center">
      <Icon className="mx-auto text-ink/70" />
      <h4 className="mt-4 font-script text-2xl text-bronze">{title}</h4>
      <p className="mt-3 text-sm leading-relaxed text-ink/75">{body}</p>
    </div>
  );
}
