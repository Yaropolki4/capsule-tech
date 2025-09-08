import { cn } from "@/lib/utils";
import { TextCell } from "@/shared/ui/ui/text-cell";

type RegisterFormLayoutProps = {
  authTitle: string;
  authDescription: string;
  emailInput: React.ReactNode;
  passwordInput: React.ReactNode;
  confirmPasswordInput: React.ReactNode;
  fullNameInput: React.ReactNode;
  nameInput: React.ReactNode;
  submitButton: React.ReactNode;
  alreadyHaveAccountButton: React.ReactNode;
  errorMessage: Maybe<string>;
};

export function RegisterFormLayout({
  authTitle,
  authDescription,
  emailInput,
  passwordInput,
  confirmPasswordInput,
  fullNameInput,
  nameInput,
  submitButton,
  alreadyHaveAccountButton,
  errorMessage,
}: RegisterFormLayoutProps) {
  return (
    <form className={cn("relative m-10", "w-[676px] max-md:w-auto")}>
      <div
        className={cn(
          "transition-opacity duration-500 opacity-100 absolute -top-20 w-full",
          !errorMessage && "invisible opacity-0"
        )}
      >
        <TextCell message={errorMessage ?? "invisible"} />
      </div>
      <div className="mb-2">
        <p className="font-medium text-2xl">{authTitle}</p>
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium">{authDescription}</p>
      </div>
      <div className="mb-4">{emailInput}</div>
      <div className="mb-4">{passwordInput}</div>
      <div className="mb-4">{confirmPasswordInput}</div>
      <div className="mb-4">{fullNameInput}</div>
      <div className="mb-4">{nameInput}</div>
      <div className="mb-2">{submitButton}</div>
      {alreadyHaveAccountButton}
    </form>
  );
}
