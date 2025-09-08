import { TextCell } from "@/shared/ui/ui/text-cell";
import { cn } from "@/lib/utils";

type LoginFormLayoutProps = {
  authTitle: string;
  errorMessage: Maybe<string>;
  emailInput: React.ReactNode;
  passwordInput: React.ReactNode;
  submitButton: React.ReactNode;
  forgotPasswordButton: React.ReactNode;
  registerButton: React.ReactNode;
  googleButton: React.ReactNode;
};

export function LoginFormLayout({
  authTitle,
  errorMessage,
  emailInput,
  passwordInput,
  submitButton,
  forgotPasswordButton,
  registerButton,
  googleButton,
}: LoginFormLayoutProps) {
  return (
    <form className="relative">
      <div
        className={cn(
          "mb-8 transition-opacity duration-500 opacity-100 absolute -top-20 w-full",
          !errorMessage && "invisible opacity-0"
        )}
      >
        <TextCell message={errorMessage ?? "invisible"} />
      </div>
      <div className="mb-4">
        <p className="font-medium text-lg">{authTitle}</p>
      </div>
      <div className="mb-4">{emailInput}</div>
      <div className="mb-6">{passwordInput}</div>
      <div className="mb-2">{submitButton}</div>
      <div className="mb-16">{forgotPasswordButton}</div>
      <div className="mb-2">{googleButton}</div>
      {registerButton}
    </form>
  );
}
