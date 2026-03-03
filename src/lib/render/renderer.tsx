"use client";

import {
  ActionProvider,
  Renderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
} from "@json-render/react";
import { useCallback, useMemo, useState } from "react";
import { createHandlers, fallbackRenderer, registry } from "./catalog-display";

type SchemaRendererProps = {
  uiTree: Spec | null;
};

export function SchemaRender(props: SchemaRendererProps) {
  const { uiTree = null } = props;
  const [context, setContextState] = useState<Record<string, unknown>>(
    uiTree?.state || {},
  );

  const setContext = useCallback((newContext: Record<string, unknown>) => {
    setContextState((prevContext) => ({ ...prevContext, ...newContext }));
  }, []);

  const getContext = useCallback(() => context, [context]);

  const actionHandlers = useMemo(
    () => createHandlers(() => setContext as never, getContext),
    [getContext, setContext],
  );

  return (
    <StateProvider initialState={uiTree?.state}>
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
