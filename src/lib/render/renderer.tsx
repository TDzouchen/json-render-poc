"use client";

import {
  ActionProvider,
  Renderer,
  type SetState,
  type Spec,
  StateProvider,
  VisibilityProvider,
} from "@json-render/react";
import { createStateStore } from "@json-render/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createHandlers, fallbackRenderer, registry } from "./catalog-display";

type SchemaRendererProps = {
  uiTree: Spec | null;
  onStateChange?: (nextState: Record<string, unknown>) => void;
};

export function SchemaRender(props: SchemaRendererProps) {
  const { uiTree = null, onStateChange } = props;
  const onStateChangeRef = useRef(onStateChange);
  const lastExternalStateRef = useRef<Record<string, unknown>>(
    uiTree?.state || {},
  );
  const storeRef = useRef(createStateStore(uiTree?.state || {}));
  const [storeVersion, setStoreVersion] = useState(0);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    const nextState = uiTree?.state || {};
    if (lastExternalStateRef.current === nextState) {
      return;
    }

    lastExternalStateRef.current = nextState;
    storeRef.current = createStateStore(nextState);
    setStoreVersion((prev) => prev + 1);
  }, [uiTree]);

  useEffect(() => {
    const store = storeRef.current;

    const syncSnapshot = () => {
      const snapshot = store.getSnapshot();
      lastExternalStateRef.current = snapshot;
      onStateChangeRef.current?.(snapshot);
    };

    const unsubscribe = store.subscribe(syncSnapshot);
    return unsubscribe;
  }, [storeVersion]);

  const setState = useCallback<SetState>((updater) => {
    const prevState = storeRef.current.getSnapshot();
    const nextState = updater(prevState);
    lastExternalStateRef.current = nextState;
    storeRef.current = createStateStore(nextState);
    onStateChangeRef.current?.(nextState);
    setStoreVersion((prev) => prev + 1);
  }, []);

  const getState = useCallback(() => storeRef.current.getSnapshot(), []);

  const actionHandlers = useMemo(
    () => createHandlers(() => setState, getState),
    [getState, setState],
  );

  return (
    <StateProvider key={storeVersion} store={storeRef.current}>
      <VisibilityProvider>
        <ActionProvider handlers={actionHandlers}>
          <Renderer
            spec={uiTree}
            registry={registry}
            fallback={fallbackRenderer}
          />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
