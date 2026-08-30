import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
import { BusinessWizard } from "@/features/business/components/BusinessWizard";

export default function BusinessCreatePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">
          Start a New Enterprise
        </h1>
      </div>
      
      <BentoGrid>
        <BentoCard className="col-span-12 md:col-span-8 md:col-start-3">
          <BusinessWizard />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
