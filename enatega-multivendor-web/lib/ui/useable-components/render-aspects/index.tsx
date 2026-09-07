import { ratingAspects } from "@/lib/utils/constants";
import { useTranslations } from "next-intl";
import { Button } from "primereact/button";
import { twMerge } from "tailwind-merge";

// Aspect button component - Toggleable buttons for rating aspects (Food quality, delivery time, etc)
const AspectButton = ({
  aspect,
  selected,
  onToggle,
}: {
  aspect: string; // Aspect text (e.g., "Food quality")
  selected: boolean; // Whether this aspect is currently selected
  onToggle: (aspect: string) => void; // Toggle callback
}) => (
  <Button
    onClick={() => onToggle(aspect)}
    className={twMerge(
      "px-4 py-2 rounded-full border border-gray-400  text-sm font-medium transition-colors",
      selected
        ? "bg-primary-color text-white border-primary-color" // Selected style
        : "bg-white dark:text-gray-300 dark:bg-gray-600 text-gray-700 border-gray-400 hover:bg-gray-50" // Unselected style
    )}
  >
    {aspect}
  </Button>
);

// Render the aspects selection UI (reused in both step 2 and 3).
// `aspects` lets the rider rating flow swap in delivery-specific options while
// keeping the store flow's default list.
function RenderAspects({
  selectedAspects,
  handleAspectToggle,
  aspects = ratingAspects,
}: {
  selectedAspects: string[]; // Array of selected aspects
  handleAspectToggle: (aspect: string) => void; // Toggle callback
  aspects?: string[];
}) {
  const t = useTranslations()
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {aspects?.map((aspect) => {
        // The toggle carries the translated label (that is what ends up in the
        // review), so the selected check has to compare against it too.
        const label = t(aspect);
        return (
          <AspectButton
            key={aspect}
            aspect={label}
            selected={selectedAspects.includes(label)}
            onToggle={handleAspectToggle}
          />
        );
      })}
    </div>
  );
}
export default RenderAspects;
