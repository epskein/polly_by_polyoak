import PollyLogo from "../../assets/images/logo/polly_logo.svg?react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

export function Logo({ ...props }: LogoProps) {
  return <PollyLogo  {...props} />;
} 