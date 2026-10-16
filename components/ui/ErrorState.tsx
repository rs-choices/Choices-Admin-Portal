import { Button } from './Button';
import { Icon } from './Icon';

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-14 text-center shadow-card">
      <span className="grid size-14 place-items-center rounded-full bg-[var(--error-opacity-10)] text-error">
        <Icon name="cloud-off" size={26} />
      </span>
      <span className="text-lg font-semibold text-ink">{title}</span>
      <span className="max-w-[420px] text-sm text-muted">{body}</span>
      {onRetry && (
        <Button size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
