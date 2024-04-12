import { ActorRefFrom, assign, stopChild, setup, createActor } from "xstate";
import { TodoMachine } from "./todo/todo.machine";

const makeId = () => Math.random().toString(36).substring(7);

export const buildTodosMachine = (todoMachine: TodoMachine) =>
  setup({
    types: {} as {
      context: {
        newTodoLabel: string;
        todos: ActorRefFrom<TodoMachine>[];
      };
      events:
        | {
            type: "Add a todo";
          }
        | {
            type: "Update new todo's label";
            label: string;
          }
        | {
            type: "Delete a todo";
            id: string;
          }
        | {
            type: "Disable";
          }
        | {
            type: "Enable";
          };
      guards: {};
      actions: {};
    },
    guards: {
      "new todo's label is valid": ({ context }) =>
        context.newTodoLabel.trim().length > 0,
    },
    actions: {
      "Stop the todo's actor": stopChild(({ context }, todoId: string) => {
        const res = context.todos.find((todo) => todo.id === todoId);
        if (!res) {
          throw new Error("Child does not exist lmfao");
        }
        return res;
      }),
      "Remove todo from context": assign({
        todos: ({ context }, todoId: string) =>
          context.todos.filter((todo) => todo.id !== todoId),
      }),
      "Update the new todo label in context": assign({
        newTodoLabel: (_, label: string) => label,
      }),
      "Add a new todo in context": assign({
        todos: ({ context, spawn }) => {
          let todo = spawn("todoMachine", {
            id: `todo-${makeId()}`,
            input: {
              label: context.newTodoLabel,
            },
          });
          return context.todos.concat(todo);
        },
      }),
      "Reset new todo's label": assign({
        newTodoLabel: "",
      }),
    },
    actors: {
      todoMachine,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBUDyARVBlAdAUQDkBBAIQBk90BidAS1gEMAjAGzAG0AGAXUVAAcA9rFoAXWoIB2fEAA9EAFgDMADhxKFARiVKATAoCsulQDYtBgDQgAnoqUBOHApNLOqk8c0nvJgL6+rNExcQlIKagBVfggGUTAAAkkwAHd40UEIQQByWHiWZjAWLl4kECERcSkZeQQTFU0cThUVJqUDexbnK1sEAHZDHF7epV7NFWGHEYN-QIxsfGJyShpCsDj4hjSMwWKZcrEJaVKavQVBzl1ezgVdTU4DTVGFbsR+k0HNT8mvOvtpgJAQXmoSW1CIEAgGy2mV2pX2lSOoBqJj+OH0ukuqmGWnsSheCAUKiUOAM7QMbQufxUBl6M0Bc1w6AAklgwss8JJmGxYQJhAcqsdFG4cI9DIYDBclN5xviHo4HrozJczEpNLp7P4AZIMnAZECsHs+Qjqohbr0PmM2jopuMTPi2g17C5OCZtAZTL1dHT9Qs2ehDRVDiaEO7zZoFL17MZeuNSSZLDZEGYGs1sSp7JHbppvQycMzWaCA-zEXJTfGLUTyTpeqG7YmCaScN5Fb145wnSiTLTNUA */
    id: "TODOS",

    context: {
      newTodoLabel: "",
      todos: [],
    },

    states: {
      ENABLED: {
        on: {
          Disable: "DISABLED",

          "Update new todo's label": {
            actions: [
              {
                type: "Update the new todo label in context",
                params: ({ event }) => event.label,
              },
            ],
            target: "ENABLED",
          },
          "Delete a todo": {
            actions: [
              {
                type: "Stop the todo's actor",
                params: ({ event }) => event.id,
              },
              {
                type: "Remove todo from context",
                params: ({ event }) => event.id,
              },
            ],
            target: "ENABLED",
          },
          "Add a todo": {
            guard: {
              type: "new todo's label is valid",
            },
            actions: ["Add a new todo in context", "Reset new todo's label"],
            target: "ENABLED",
          },
        },
      },
      DISABLED: {
        on: {
          Enable: "ENABLED",
        },
      },
    },
    initial: "DISABLED",
  });

export type TodosMachine = ReturnType<typeof buildTodosMachine>;
export type TodosActor = ReturnType<typeof createActor<TodosMachine>>;
export type TodosActions = Parameters<TodosMachine["provide"]>[0]["actions"];
