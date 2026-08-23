import { PageHeader } from "@/components/PageHeader";
import { NewPlayerForm } from "@/components/NewPlayerForm";

export default function NewPlayerPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader title="Spieler hinzufügen" subtitle="Legt automatisch ein Benutzerkonto sowie ein Spielerprofil an" />
      <div className="card max-w-3xl p-5 sm:p-6">
        <NewPlayerForm />
      </div>
    </div>
  );
}
