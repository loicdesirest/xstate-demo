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
    "Save todo on server": fromPromise(async () => {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }),
    "Log save operation": fromPromise(async () => {
      // Simulate network request
      console.log("Logging save operation...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Save operation has been logged");

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
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUGIAiYA2YyYABGhgNoAMAuoqAA6qwCWyzqAdnSAB6IC0ATgAcAOgBMAZkEA2cQEZ5lAKzKA7DPmSANCACeA+conjhWgCyDllBWvHjlAX0e6yWAMoBDAG4k3VWiQQRhY2Tm4+BDVBQVFlGTVhETVzBxTBXQMEe3NRQUphBXMU8RlhNWdXdFRRAFUABWwAQQAVAFFRACU2puwASQA5AHFMNohWUmqA7hDWdi4gyP55NWNxc2K7cUpJLRTzTMRVGTiCzSlKDXyKlxA3OsbWjrb+lsGR2voITyJiPE8AEb4aZBWZhBagSKSZTyURqOyJcwqZTbDbKQ4IZSSSRwwo7QoibGqSp3aoPZrtUQvPpvYaYADCng4AGNgTQZkw5uFFoh5LlJJRBEjhKopDJBYJxBiNmJymp5JLTJRxdESfcGhTnq93pgvL5JhR2aDOeCIohipQ8tizuY5OZJMUDvpzYo4bJ4sVJKt5MIHWqyRqnqJ3E0AGo6jAcMCiZgcbyoADW0fVj0pIfDwwQsfjzJ+8wCIIYJvmZoQy1hMl2InUyoJ5mUTqy4isEiSWikzZklhkThJHHQcG4bg5oRLPLL4nlEg28PsOz26OdCEKomk0koBSUkpkgn9GFEACEmvSANJDToAeVqA2wxAAMhehkN3iOuRDeIgSnlEsr4sphMIOwYg6OKSL6WJqCowo2L2VT7oG7Svqa478PYOLrJsc67F6GwYvIO6iEk65dooRK7rcKaal0PT9MMSFjpChhqOhM7ykiIiASswH4XERg7vxko7Boe41AhWo0i+xqjtyjHZFOVgAesIoNkiOhLsUFZCSiDiUAqInkkG6aSUW0nvlCCqiDulgOOUAHVhiaSroIYEcZIdobJIzjOEAA */
  id: "todo",
  context: ({ input }) => ({
    previousLabel: input.label,
    label: input.label,
  }),
  states: {
    "BACKGROUND LOGGING": {
      invoke: {
        src: "Log save operation",
      },
    },
    UPDATE: {
      states: {
        READING: {
          tags: ["read"],
          on: {
            "Edit todo": {
              target: "EDITING",
              reenter: true,
            },
          },
        },

        EDITING: {
          tags: ["form"],
          on: {
            "Update label": {
              actions: [
                {
                  type: "Update label in context",
                  params: ({ event }) => event.label,
                },
              ],
              target: "EDITING",
            },
            Cancel: {
              target: "READING",
              actions: ["Set back previous label"],
              reenter: true,
            },
            "Save todo": {
              target: "SAVING",
              reenter: true,
            },
          },
        },

        SAVING: {
          tags: ["saving"],
          invoke: {
            src: "Save todo on server",

            onDone: {
              target: "READING",
              actions: "Update previous label in context",
            },
          },
        },
      },
      initial: "READING",
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
    "Save todo": ".BACKGROUND LOGGING",
  },
  type: "parallel",
});

export type TodoMachine = typeof todoMachine;
export type TodoActions = Parameters<TodoMachine["provide"]>[0]["actions"];
export type TodoSnapshot = ReturnType<Actor<TodoMachine>["getSnapshot"]>;
