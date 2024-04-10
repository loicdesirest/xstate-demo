import { Actor, assign, fromPromise, sendParent, setup } from "xstate";

export const todoMachine = setup({
  types: {
    context: {} as {
      previousLabel: string;
      label: string;
    },
    events: {} as
      | {
          type: "Update label";
          label: string;
        }
      | {
          type: "Save todo";
        }
      | {
          type: "Edit todo";
        }
      | {
          type: "Cancel";
        }
      | {
          type: "Delete todo";
        },
    input: {} as {
      label: string;
    },
    tags: {} as "read" | "form" | "saving",
  },
  actors: {
    "Save todo": fromPromise(async () => {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }),
  },
  actions: {
    "Update previous label in context": assign({
      previousLabel: ({ context }) => context.label,
    }),
    "Update label in context": assign({
      label: (_, label: string) => label,
    }),
    "Send delete event to parent": sendParent(({ self }) => ({
      type: "Delete a todo",
      id: self.id,
    })),
    "Set back previous label": assign({
      label: ({ context }) => context.previousLabel,
    }),
    "React to todo entering READING state": () => {},
    "React to todo entering EDITING state": () => {},
    "React to todo entering SAVING state": () => {},
    "React to todo updating it's label": () => {},
    "React to todo canceling it's label update": () => {},
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUGIAiYA2YyYABGhgNoAMAuoqAA6qwCWyzqAdnSAB6IBMATkEA6ABwB2fvwDMEmQDZBAVkESFCgDQgAnogC0MyuKX8AjMv6V+C-soAsNgL5PtZVCIBKAUQCC2AEkAOQBxTG8IVlJ0VCpaJBBGFjZObj4EZQkRfikxM0ExDTl7e2VtPQRHZREZMX4xSgL7CTNasRc3GJFvQIAVYLCAZQBDADcSdzjuJNZ2LgT0iXsFbLF7M357AsEFSzFyxBKxcTqGppa2jpB3br6BzABVeghhomI8YYAjfCmEmZT5qB0sszCJWpJlApJGtJBIyrpEMoHCIJHC4WIZK1lJRKPYrjcegF+qFMABhYYcADGPxo0yYs1SC0QZgUWQcUNs+WamUoEgOCCMolq9UaawuYnarmuXUGvgAavcMBwwCJmBxRqgANYqm6yhWhBBqjWU15zOK-Bj0gFpRCY47mSgShSNOR2GT8swSkTKRSlB24hrLFxSjjoODcdx05JzG0IfRmT38wT8ESNBQyex5azNdOSzoYLx+QKhKMMwG8AwSSgeiSiVTpzNmbPqWr4rqE4khUvWpkC+zGdmFcyCblVvkIyp2GqnUXNcF56UFvUDbsx3saYyCYoSMSZJt1fj8qzGNMZrObFuSlxAA */
  id: "todo",
  initial: "READING",
  context: ({ input }) => ({
    previousLabel: input.label,
    label: input.label,
  }),
  states: {
    READING: {
      tags: "read",

      on: {
        "Edit todo": "EDITING",
      },

      entry: "React to todo entering READING state",
    },
    EDITING: {
      tags: "form",

      on: {
        "Save todo": {
          target: "SAVING",
        },

        "Update label": {
          actions: [
            {
              type: "Update label in context",
              params: ({ event }) => event.label,
            },
            {
              type: "React to todo updating it's label",
            },
          ],
        },

        Cancel: {
          target: "READING",
          actions: [
            "Set back previous label",
            "React to todo canceling it's label update",
          ],
        },
      },

      entry: ["React to todo entering EDITING state"],
    },

    SAVING: {
      tags: ["form", "saving"],

      invoke: {
        src: "Save todo",
        onDone: {
          target: "READING",
          actions: {
            type: "Update previous label in context",
          },
        },
      },

      entry: "React to todo entering SAVING state",
    },
  },
  on: {
    "Delete todo": {
      target: "#todo",
      actions: [
        {
          type: "Send delete event to parent",
        },
      ],
    },
  },
});

export type TodoMachine = typeof todoMachine;
export type TodoActions = Parameters<TodoMachine["provide"]>[0]["actions"];
export type TodoSnapshot = ReturnType<Actor<TodoMachine>["getSnapshot"]>;
