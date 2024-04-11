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
    "React to todo entering READING state": () => {},
    "React to todo entering EDITING state": () => {},
    "React to todo entering SAVING state": () => {},
    "React to todo updating it's label": () => {},
    "React to todo canceling it's label update": () => {},
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUGIAiYA2YyYABGhgNoAMAuoqAA6qwCWyzqAdnSAB6IBMlfgDoArAE4AzKKGUAHAHYAjOIBsCyQBoQAT0QBaScMmSFAFnELVq8YspmbkgL5PtZLAGUAhgDcSyADN0VCpaJBBGFjZObj4EJSUZYSVJSiE5VX4zUTN+OW09BH5VSmEFcX5RfgVKoXEXN2DhAFUABWwAQQAVAFFhACUejuwASQA5AHFMHohWUmDQ7kjWdi5wuP1E0rUZDQcshUOCxGsRVTMzRTlxCoUqpQaQdxb27r6e0a7xqeb6CC8iMQ8F4AEb4RbhZbRNagOJ5cTCQRVc5yBJKBSKY4IOSUVTJSRmKziJSVaokx7PNqdXrCD4jL6TTAAYS8HAAxuCaEsmCsYusDKIlGVirjchYCYlxFiLHJEZZroITGk5NkKU0qW9aZ9vphvH55hQuZCedDYogFJRRGJVCS5JJMndJCSsechSVLtIzKl+JJiWqMC9qX0PB0AGo6jAcMDCZgcHyoADW0cprxpIfDkwQsfjbIBq1CEIYJtWZqKJmS6NyGNxolUOSxTtllESFrt2UtCQULlcIA46Dg3Hc3KiJf5CH0xQRWUJyjMlFsOP4WKUZiFgtEyjrql9lDu-H9qGEACEOkyANITfoAeWaY2wxAAMleJhNvsPeTDeIgEvZhHJ+BUJQ7sS8jSnWZSiP+XqoruhyqAegZvO+ppjhO-BCtOhwrvOcg4uiWL8ABwjNhukjVIcxKSHIogIRqNKDMMb7GiOfKwgY6JGJhs44XhCgNkoeLrjYwkVJQpjwT2KZBlq9JMUWLGfnCKTEco5jlCouHWKoLrgWp8hzoR84ErRqbBmGckRMWrFfggmQiBUUG1tBqiovxsriZYAm4RcghmN2ThAA */
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

          entry: "React to todo entering READING state",
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
                {
                  type: "React to todo updating it's label",
                },
              ],

              target: "EDITING",
            },

            Cancel: {
              target: "READING",

              actions: [
                "Set back previous label",
                "React to todo canceling it's label update",
              ],

              reenter: true,
            },

            "Save todo": {
              target: "SAVING",
              reenter: true,
            },
          },

          entry: "React to todo entering EDITING state",
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
          entry: ["React to todo entering SAVING state"],
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
