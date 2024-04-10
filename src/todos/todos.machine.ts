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
          let a = spawn("todoMachine", {
            id: `todo-${makeId()}`,
            input: {
              label: context.newTodoLabel,
            },
          });
          return context.todos.concat(a);
        },
      }),
      "Reset new todo's label": assign({
        newTodoLabel: "",
      }),
      "React to todo addition": () => {},
      "React to new todo update": () => {},
      "React to todo deletion": (_, _todoId: string) => {},
      "React to enter DISABLED": () => {},
      "React to enter ENABLED": () => {},
    },
    actors: {
      todoMachine,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBUDyARVBlAdAUQDkBBAIQBk90BiAVQAcIBDAFzAAIA7MAdzeYHsI-AOSw2AG0YAjMOIDaABgC6iUHX6wAls038OqkAA9EAWgCMADgs4A7GYUBWBzYUA2AMyPXDgDQgAnogALEEATDgKoa4AnKHuFgruoTYO0a4Avul+aJi4hKQU1EQQEGyMfIL8iipIIOpaOnoGxgihYTjuDokWrhY2Vgpm0UF+gQg24dE2-aEW9rHuQYmZ2RjY+MTklFTosmCsZRVC1Qb12rr6tS3mbbbRZkGuUc4KQQ4Po4hTOJZ2syl2ByuIIrEA5db5LbUdCaWDScRgE61M6NS6gFpBdzuHDRBzuMyzLHOTHDT4IdzfF5OUJmVJdCzuUHg3DoACSWAK2zwHHhiOUpw05yaV0QcSCtgcFic3R67jsZKC0WsQQSNNlNiSSUyWRAHEEcAMzIFDQuzVMcVctnsThcHi8vgCpjM2IcoRpEwmuOSVjMTLWeU2hWNQrRRkQDxsHU6Ck9oXeSzjZKxZhwcwUCgsIWir3cHhBOuZODZHKhwdRZvJaR+SxsrjcQLiePcCqVOBVkUsHg1cVC2vSQA */
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
              "React to new todo update",
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
              {
                type: "React to todo deletion",
                params: ({ event }) => event.id,
              },
            ],

            target: "ENABLED",
          },

          "Add a todo": {
            guard: {
              type: "new todo's label is valid",
            },

            actions: [
              "Add a new todo in context",
              "Reset new todo's label",
              "React to todo addition",
            ],

            target: "ENABLED",
          },
        },

        entry: "React to enter ENABLED",
      },

      DISABLED: {
        on: {
          Enable: "ENABLED",
        },

        entry: "React to enter DISABLED",
      },
    },

    initial: "ENABLED",
  });

export type TodosMachine = ReturnType<typeof buildTodosMachine>;
export type TodosActor = ReturnType<typeof createActor<TodosMachine>>;
export type TodosActions = Parameters<TodosMachine["provide"]>[0]["actions"];
