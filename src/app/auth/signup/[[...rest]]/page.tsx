import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 text-slate-100 md:pt-24"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(6, 17, 32, 0.42) 0%, rgba(4, 12, 24, 0.48) 100%), url('/dashboard-neural-bg.svg')`,
                backgroundSize: "auto, cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                backgroundColor: "#061120",
            }}
        >
            <div className="w-full max-w-md px-4">
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-[#0b1020]/70 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
                            headerTitle: "text-white font-bold text-2xl",
                            headerSubtitle: "text-slate-400",
                            socialButtonsBlockButton: "border-white/10 bg-white/5 text-white hover:bg-white/10",
                            formButtonPrimary: "bg-linear-to-r from-[#6b7dff] to-[#8f72ff] text-white hover:opacity-90",
                            formFieldInput: "bg-[#0a1a2e] border-white/10 text-white placeholder-slate-500",
                            footerActionLink: "text-[#8fd5ff] hover:text-[#a8efff]",
                        },
                    }}
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                    signInUrl="/auth/signin"
                />
            </div>
        </div>
    );
}
