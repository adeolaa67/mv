import { PolicyCard as PolicyCardType } from "@/lib/types";
import PolicyCard from "./PolicyCard";

type BookingPoliciesProps = {
  policies: PolicyCardType[];
};

export default function BookingPolicies({ policies }: BookingPoliciesProps) {
  return (
    <section className="px-6 pb-16">
      <h2 className="text-center font-display text-2xl md:text-3xl tracking-widest2 uppercase">
        Booking Policies
      </h2>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {policies.map((policy) => (
          <PolicyCard key={policy.title} {...policy} />
        ))}
      </div>
    </section>
  );
}
