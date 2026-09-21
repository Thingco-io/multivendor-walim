'use client';

// Core
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

// Custom Components
import Image from '@/lib/ui/useable-components/safe-image';

// Interfaces
import { IRiderStore } from '@/lib/utils/interfaces/rider.interface';

const MAX_VISIBLE_STORES = 4;
const AVATAR_SIZE = 28;
const PANEL_WIDTH = 240;
const VIEWPORT_MARGIN = 16;

function StoreAvatar({
  store,
  size = AVATAR_SIZE,
  className = '',
}: {
  store: IRiderStore;
  size?: number;
  className?: string;
}) {
  if (store.image) {
    return (
      <Image
        src={store.image}
        alt={store.name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gray-200 font-semibold uppercase text-gray-600 dark:bg-dark-600 dark:text-gray-200 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {store.name?.charAt(0) || '?'}
    </div>
  );
}

/**
 * Overlapping avatar stack for the stores a rider is assigned to. Only the
 * first few stores get an avatar in the row itself — the rest collapse into
 * a "+N" bubble — and hovering the stack reveals every assigned store in a
 * floating panel.
 *
 * The panel is portaled to document.body instead of positioned inline,
 * because the riders table scrolls its body (`overflow: auto`), which would
 * otherwise clip a panel that extends past the row.
 */
export default function AssignedStoresStack({
  stores,
}: {
  stores?: IRiderStore[] | null;
}) {
  const t = useTranslations();
  const list = stores ?? [];
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  if (!list.length) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {t('No stores assigned')}
      </span>
    );
  }

  const visibleStores = list.slice(0, MAX_VISIBLE_STORES);
  const overflowCount = list.length - visibleStores.length;

  const openPanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const estimatedHeight = Math.min(list.length, 5) * 40 + 40;
      let top = rect.bottom + 8;
      if (top + estimatedHeight > window.innerHeight - VIEWPORT_MARGIN) {
        top = rect.top - estimatedHeight - 8;
      }
      let left = rect.left;
      if (left + PANEL_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
        left = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
      }
      setCoords({ top, left });
    }
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center py-1"
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
      >
        <div className="flex items-center">
          {visibleStores.map((store, index) => (
            <div
              key={store._id}
              className="-ml-2 first:ml-0"
              style={{ zIndex: visibleStores.length - index }}
            >
              <StoreAvatar
                store={store}
                className="border-2 border-white dark:border-dark-900"
              />
            </div>
          ))}
          {overflowCount > 0 && (
            <div
              className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-semibold text-gray-600 dark:border-dark-900 dark:bg-dark-600 dark:text-gray-200"
              style={{ zIndex: 0 }}
            >
              +{overflowCount}
            </div>
          )}
        </div>
      </div>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[9999] w-60 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-dark-600 dark:bg-dark-900"
            style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH }}
            onMouseEnter={openPanel}
            onMouseLeave={closePanel}
          >
            <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('Assigned Stores')} ({list.length})
            </p>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {list.map((store) => (
                <li
                  key={store._id}
                  className="flex items-center gap-2 rounded px-1 py-1 text-xs"
                >
                  <StoreAvatar store={store} size={20} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-700 dark:text-white">
                      {store.name}
                    </p>
                    {store.address && (
                      <p className="truncate text-[10px] text-gray-400 dark:text-gray-500">
                        {store.address}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
