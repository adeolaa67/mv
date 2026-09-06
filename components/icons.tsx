import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <path d="M12 21s-6.5-6.13-6.5-11A6.5 6.5 0 1 1 18.5 10c0 4.87-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <path d="M14 3.5c.5 2.3 2 3.7 4.3 3.9v2.6c-1.6 0-3-.5-4.3-1.4v6.1a5 5 0 1 1-4.3-5v2.7a2.3 2.3 0 1 0 1.9 2.3V3.5H14Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <path d="M6.5 3.5h2.7l1.3 3.8-1.9 1.6a12 12 0 0 0 5.5 5.5l1.6-1.9 3.8 1.3v2.7c0 1-.9 1.8-1.9 1.6-6.6-1-11.5-5.9-12.5-12.5-.2-1 .6-1.9 1.6-1.9Z" />
    </svg>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M6 14.5h4" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function RefundIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} {...base} {...props}>
      <path d="M4 12a8 8 0 1 1 2.6 5.9" />
      <path d="M4 17.5V13h4.5" />
      <path d="M12 8.5v7M9.7 10.3c0-1 1-1.8 2.3-1.8s2.3.7 2.3 1.6c0 2.2-4.6 1-4.6 3.2 0 .9 1 1.6 2.3 1.6s2.3-.7 2.3-1.7" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
      <path d="M7.5 13.5h1.2M11.4 13.5h1.2M15.3 13.5h1.2M7.5 16.8h1.2M11.4 16.8h1.2M15.3 16.8h1.2" />
    </svg>
  );
}

export function FullscreenIcon({ active, ...props }: IconProps & { active?: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
      <path d="M9 4.5H4.5V9" />
      <path d="M15 4.5h4.5V9" />
      <path d="M9 19.5H4.5V15" />
      <path d="M15 19.5h4.5V15" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
      <path d="M4.5 9V4.5H9" />
      <path d="M19.5 9V4.5H15" />
      <path d="M4.5 15v4.5H9" />
      <path d="M19.5 15v4.5H15" />
    </svg>
  );
}

export function CategoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10.5h18" />
      <path d="M7 14.5h4" />
    </svg>
  );
}
