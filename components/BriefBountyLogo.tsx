import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

/**
 * Logo = ready-made FontAwesome icon (newspaper) + plain wordmark.
 * No custom SVG is drawn. Icon source documented in README.
 * https://fontawesome.com/icons/newspaper
 */
export function BriefBountyLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded border border-line bg-primary text-paper">
        <FontAwesomeIcon icon={faNewspaper} className="h-[18px] w-[18px]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block headline text-[19px]">BriefBounty</span>
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.24em] text-muted">The Creative Review</span>
        </span>
      )}
    </span>
  );
}
