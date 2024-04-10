import { createActor } from "xstate";
import { renderReactApp } from "./react";
import { setupVanillaHtmlJsRenderer } from "./vanilla";
import { todoMachine } from "../todos/todo/todo.machine";
import { buildTodosMachine } from "../todos/todos.machine";

const reactRoot = document.getElementById("react-root")!;

export const runApp = () => {
  const {
    provideTodoActionsWith,
    provideTodosActionsWith,
    setupEventsWithActor,
  } = setupVanillaHtmlJsRenderer();

  const todosMachine = buildTodosMachine(
    todoMachine.provide({
      actions: provideTodoActionsWith,
    })
  );

  const todosActor = createActor(
    todosMachine.provide({
      actions: provideTodosActionsWith,
    })
  );

  setupEventsWithActor(todosActor);

  todosActor.start();

  renderReactApp(reactRoot, todosActor);
};
