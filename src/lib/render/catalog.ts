import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Web playground component catalog
 *
 * This defines the components available for AI generation in the playground.
 * Components and actions are implemented in lib/registry.tsx via defineRegistry.
 *
 * Keep schemas simple — one format per prop, no unions.
 * Fewer components = less confusion for the AI.
 */
export const playgroundCatalog = defineCatalog(schema, {
  components: {
    // ── Layout ──────────────────────────────────────────────────────────
    Card: {
      props: z.object({
        title: z.string().nullable(),
        description: z.string().nullable(),
        maxWidth: z.enum(["sm", "md", "lg", "full"]).nullable(),
        centered: z.boolean().nullable(),
      }),
      slots: ["default"],
      description:
        "Container card for content sections. Use for forms/content boxes, NOT for page headers.",
    },

    Stack: {
      props: z.object({
        direction: z.enum(["horizontal", "vertical"]).nullable(),
        gap: z.enum(["none", "sm", "md", "lg"]).nullable(),
        align: z.enum(["start", "center", "end", "stretch"]).nullable(),
        justify: z
          .enum(["start", "center", "end", "between", "around"])
          .nullable(),
      }),
      slots: ["default"],
      description: "Flex container for layouts",
    },

    Grid: {
      props: z.object({
        columns: z.number().nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description: "Grid layout (1-6 columns)",
    },

    Separator: {
      props: z.object({
        orientation: z.enum(["horizontal", "vertical"]).nullable(),
      }),
      description: "Visual separator line",
    },

    Tabs: {
      props: z.object({
        tabs: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        ),
        defaultValue: z.string().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description:
        "Tab navigation. Use statePath to bind the active tab value.",
    },

    Accordion: {
      props: z.object({
        items: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
          }),
        ),
        type: z.enum(["single", "multiple"]).nullable(),
      }),
      description:
        "Collapsible sections. Items as [{title, content}]. Type 'single' (default) or 'multiple'.",
    },

    Collapsible: {
      props: z.object({
        title: z.string(),
        defaultOpen: z.boolean().nullable(),
      }),
      slots: ["default"],
      description: "Collapsible section with trigger. Children render inside.",
    },

    Dialog: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        openPath: z.string(),
      }),
      slots: ["default"],
      description:
        "Modal dialog. Set openPath to a boolean state path. Use setState to toggle.",
    },

    Drawer: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        openPath: z.string(),
      }),
      slots: ["default"],
      description:
        "Bottom sheet drawer. Set openPath to a boolean state path. Use setState to toggle.",
    },

    Carousel: {
      props: z.object({
        items: z.array(
          z.object({
            title: z.string().nullable(),
            description: z.string().nullable(),
          }),
        ),
      }),
      description: "Horizontally scrollable carousel of cards.",
    },

    // ── Data Display ────────────────────────────────────────────────────
    Table: {
      props: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.string())),
        caption: z.string().nullable(),
      }),
      description:
        'Data table. columns: header labels. rows: 2D array of cell strings, e.g. [["Alice","admin"],["Bob","user"]].',
    },

    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["h1", "h2", "h3", "h4"]).nullable(),
      }),
      description: "Heading text (h1-h4)",
    },

    Text: {
      props: z.object({
        text: z.string(),
        variant: z
          .enum(["body", "caption", "muted", "lead", "code"])
          .nullable(),
      }),
      description: "Paragraph text",
    },

    Image: {
      props: z.object({
        alt: z.string(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      }),
      description: "Placeholder image (displays alt text in a styled box)",
    },

    Video: {
      props: z.object({
        url: z.string(),
        alt: z.string().nullable(),
      }),
      description: "Native video renderer.",
    },

    Audio: {
      props: z.object({
        url: z.string(),
        alt: z.string().nullable(),
      }),
      description: "Native audio renderer.",
    },

    Avatar: {
      props: z.object({
        src: z.string().nullable(),
        name: z.string(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      description: "User avatar with fallback initials",
    },

    Badge: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["default", "success", "warning", "danger"]).nullable(),
      }),
      description: "Status badge",
    },

    Alert: {
      props: z.object({
        title: z.string(),
        message: z.string().nullable(),
        type: z.enum(["info", "success", "warning", "error"]).nullable(),
      }),
      description: "Alert banner",
    },

    Progress: {
      props: z.object({
        value: z.number(),
        max: z.number().nullable(),
        label: z.string().nullable(),
      }),
      description: "Progress bar (value 0-100)",
    },

    Skeleton: {
      props: z.object({
        width: z.string().nullable(),
        height: z.string().nullable(),
        rounded: z.boolean().nullable(),
      }),
      description: "Loading placeholder skeleton",
    },

    Spinner: {
      props: z.object({
        size: z.enum(["sm", "md", "lg"]).nullable(),
        label: z.string().nullable(),
      }),
      description: "Loading spinner indicator",
    },

    Tooltip: {
      props: z.object({
        content: z.string(),
        text: z.string(),
      }),
      description: "Hover tooltip. Shows content on hover over text.",
    },

    Popover: {
      props: z.object({
        trigger: z.string(),
        content: z.string(),
      }),
      description: "Popover that appears on click of trigger.",
    },

    Rating: {
      props: z.object({
        value: z.number(),
        max: z.number().nullable(),
        label: z.string().nullable(),
      }),
      description: "Star rating display",
    },

    // ── Charts ──────────────────────────────────────────────────────────
    BarGraph: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          }),
        ),
      }),
      description: "Vertical bar chart",
    },

    LineGraph: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          }),
        ),
      }),
      description: "Line chart with points",
    },

    // ── Form Inputs ─────────────────────────────────────────────────────
    Input: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        type: z.enum(["text", "email", "password", "number"]).nullable(),
        placeholder: z.string().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["submit", "focus", "blur"],
      description: "Text input field. Use statePath for two-way binding.",
    },

    Textarea: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        placeholder: z.string().nullable(),
        rows: z.number().nullable(),
        statePath: z.string().nullable(),
      }),
      description: "Multi-line text input. Use statePath for binding.",
    },

    Select: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        options: z.array(z.string()),
        placeholder: z.string().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Dropdown select input. Use statePath for binding.",
    },

    Checkbox: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        checked: z.boolean().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Checkbox input. Use statePath for binding.",
    },

    Radio: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        options: z.array(z.string()),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Radio button group. Use statePath for binding.",
    },

    Switch: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        checked: z.boolean().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Toggle switch. Use statePath for binding.",
    },

    Slider: {
      props: z.object({
        label: z.string().nullable(),
        min: z.number().nullable(),
        max: z.number().nullable(),
        step: z.number().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Range slider input. Use statePath for binding.",
    },

    // ── Actions ─────────────────────────────────────────────────────────
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "danger"]).nullable(),
        disabled: z.boolean().nullable(),
      }),
      events: ["press"],
      description: "Clickable button. Bind on.press for handler.",
    },

    Link: {
      props: z.object({
        label: z.string(),
        href: z.string(),
      }),
      events: ["press"],
      description: "Anchor link. Bind on.press for click handler.",
    },

    DropdownMenu: {
      props: z.object({
        label: z.string(),
        items: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        ),
      }),
      events: ["select"],
      description: "Dropdown menu with trigger button and selectable items.",
    },

    Toggle: {
      props: z.object({
        label: z.string(),
        pressed: z.boolean().nullable(),
        statePath: z.string().nullable(),
        variant: z.enum(["default", "outline"]).nullable(),
      }),
      events: ["change"],
      description: "Toggle button. Use statePath for pressed state binding.",
    },

    ToggleGroup: {
      props: z.object({
        items: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        ),
        type: z.enum(["single", "multiple"]).nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description:
        "Group of toggle buttons. Type 'single' (default) or 'multiple'.",
    },

    ButtonGroup: {
      props: z.object({
        buttons: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        ),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Segmented button group. Use statePath for selected value.",
    },

    Pagination: {
      props: z.object({
        totalPages: z.number(),
        statePath: z.string(),
      }),
      events: ["change"],
      description:
        "Page navigation. Bind statePath to a number for current page.",
    },
  },

  actions: {
    setState: {
      params: z.object({
        statePath: z.string(),
        value: z.unknown(),
      }),
      description: "Update a value in the state model at the given statePath.",
    },

    pushState: {
      params: z.object({
        statePath: z.string(),
        value: z.unknown(),
        clearStatePath: z.string().optional(),
      }),
      description:
        'Append an item to an array in state. Value can contain {"$state":"/statePath"} refs and "$id" for auto IDs. clearStatePath resets another path after pushing.',
    },

    removeState: {
      params: z.object({
        statePath: z.string(),
        index: z.number(),
      }),
      description: "Remove an item from an array in state at the given index.",
    },

    buttonClick: {
      params: z.object({
        message: z.string().nullable(),
      }),
      description: "Shows a toast with the message.",
    },

    formSubmit: {
      params: z.object({
        formName: z.string().nullable(),
      }),
      description: "Shows a toast confirming form submission.",
    },

    linkClick: {
      params: z.object({
        href: z.string(),
      }),
      description: "Shows a toast with the link destination.",
    },
  },
});