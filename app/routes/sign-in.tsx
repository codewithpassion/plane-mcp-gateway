import { SignIn } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
			<SignIn
				routing="hash"
				afterSignInUrl="/app/configs"
				signUpUrl="/sign-in"
			/>
		</div>
	);
}
