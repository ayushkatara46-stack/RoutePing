'use client';

// =============================================
// Sidebar Context — Draggable & Resizable Slide-bar
// Drag freely to open/close or size however much you want!
// =============================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

interface SidebarContextType {
  width: number;
  collapsed: boolean;
  isDragging: boolean;
  toggleSidebar: () => void;
  setWidth: (width: number) => void;
  startDragging: (e: React.MouseEvent | React.TouchEvent) => void;
}

const MIN_WIDTH = 0;
const SNAP_COLLAPSE_THRESHOLD = 70;
const DEFAULT_WIDTH = 240;
const MAX_WIDTH = 480;

const SidebarContext = createContext<SidebarContextType>({
  width: DEFAULT_WIDTH,
  collapsed: false,
  isDragging: false,
  toggleSidebar: () => {},
  setWidth: () => {},
  startDragging: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [width, setWidthState] = useState<number>(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastExpandedWidth = useRef<number>(DEFAULT_WIDTH);

  // Load saved width from localStorage
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('admin_sidebar_width');
      if (savedWidth !== null) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= MAX_WIDTH) {
          setWidthState(parsed);
          if (parsed > SNAP_COLLAPSE_THRESHOLD) {
            lastExpandedWidth.current = parsed;
          }
        }
      }
    } catch {
      // Ignore in SSR
    }
  }, []);

  const setWidth = useCallback((newWidth: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    const finalWidth = clamped < SNAP_COLLAPSE_THRESHOLD ? 0 : clamped;
    setWidthState(finalWidth);
    if (finalWidth > SNAP_COLLAPSE_THRESHOLD) {
      lastExpandedWidth.current = finalWidth;
    }
    try {
      localStorage.setItem('admin_sidebar_width', String(finalWidth));
    } catch {
      // Ignore
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setWidthState((prev) => {
      let next: number;
      if (prev > 0) {
        next = 0;
      } else {
        next = lastExpandedWidth.current > 0 ? lastExpandedWidth.current : DEFAULT_WIDTH;
      }
      try {
        localStorage.setItem('admin_sidebar_width', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Global mouse & touch listeners for smooth dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      if (newWidth < SNAP_COLLAPSE_THRESHOLD) {
        setWidthState(0);
      } else {
        const clamped = Math.min(MAX_WIDTH, Math.max(160, newWidth));
        setWidthState(clamped);
        lastExpandedWidth.current = clamped;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const newWidth = e.touches[0].clientX;
        if (newWidth < SNAP_COLLAPSE_THRESHOLD) {
          setWidthState(0);
        } else {
          const clamped = Math.min(MAX_WIDTH, Math.max(160, newWidth));
          setWidthState(clamped);
          lastExpandedWidth.current = clamped;
        }
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
      setWidthState((current) => {
        try {
          localStorage.setItem('admin_sidebar_width', String(current));
        } catch {
          // Ignore
        }
        return current;
      });
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
    };
  }, [isDragging]);

  const startDragging = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  const collapsed = width === 0;

  return (
    <SidebarContext.Provider
      value={{
        width,
        collapsed,
        isDragging,
        toggleSidebar,
        setWidth,
        startDragging,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
