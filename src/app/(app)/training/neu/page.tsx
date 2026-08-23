import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { NewTrainingForm } from "@/components/NewTrainingForm";

export default async function NewTrainingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "CAPTAIN" && session?.user.role !== "MANAGER") {
    redirect("/training");
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Training anlegen" subtitle="Legt einen neuen Trainingstermin an und benachrichtigt das gesamte Team" />
      <div className="card max-w-3xl p-5 sm:p-6">
        <NewTrainingForm />
      </div>
    </div>
  );
}
