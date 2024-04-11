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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUGIAiYA2YyYABGhgNoAMAuoqAA6qwCWyzqAdnSAB6IBMlfgDoArAE4AzKKGUAHAHYAjOIBsCyQBoQAT0QBaScMmSFAFnELVq8YspmbkgL5PtZLAGUAhgDcSyADN0VCpaJBBGFjZObj4EBXFxMXU5W3N+UXNxbT0Efn4zYXF5fiUzdNVFFzdg4QBVAAVsAEEAFQBRYQAldubsAEkAOQBxTHaIVlJg0O5I1nYucLj9JQVRYQLyhXzKSSVTMzMcxFFRVTF5VSV+SUorYoVqkHd6prbO9oHWodG6+ggvERiHgvAAjfAzcJzaKLUBxaRKYQKbYKORmSinQSHUTHBCiExIuSCSRE2wmU5PF6NFodYSffrfEaYADCXg4AGMITRZkx5jElogysZKOJ0XJMZJVCLxPxcYc5MJFMoZfw5JQpQlKbVqe86V8fphvH4phRuVDeTDYohypQiiZLg4CpJykddNalIiEqozuVTKIlHJnVqMK8aZ0PM0AGoGjAcMDCZgcHyoADW8apb1pEejIwQieT7MBC1CkIYFoWVoQK0Rqj2tky6tJZlErty-HE61V4n2N3bqgs3pcrhAHHQcG47h5UQrAqr-GUG0OyJ2ez9uI9Cu9aiU+JM5kOSmDqGEACFmsyANLDLoAeTqg2wxAAMjfhsMflO+bDeIh0kVUeqZyiHIapaG6CDOkYJLSKYGJikIohHqG7yfpas76PkRibMuxL7PuuKCOcO7booO7IrcqhITqtI9H0H7mtO-JwgYqxYUuyjorYaqrLieznP6ZxqEJxJWFRmYfPqIyoTOzF5AuHYgQU4otuiYG5OUNa7Gs+QyCoYlhsI2b0WWjHfnEYrCLW+SiqSchSqoBFSJZEiqDsljcRoQ5OEAA */
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
    "Save tfodo": ".BACKGROUND LOGGING",
  },
  type: "parallel",
});

export type TodoMachine = typeof todoMachine;
export type TodoActions = Parameters<TodoMachine["provide"]>[0]["actions"];
export type TodoSnapshot = ReturnType<Actor<TodoMachine>["getSnapshot"]>;
