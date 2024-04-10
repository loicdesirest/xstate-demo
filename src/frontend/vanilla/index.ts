// A vanilla js todo app using the state machine

import { TodoActions } from "../../todos/todo/todo.machine";
import { TodosActions, TodosActor } from "../../todos/todos.machine";

const vanillaRoot = document.getElementById("vanilla-root")!;

vanillaRoot.innerHTML = `
<div>
 <h2>Vanilla todos</h2>
   <form id="new-todo-form">
    <input id="todo-input" type="text" /><button id="add-todo">Add Todo</button>
  </form>
 <ul id="todos"></ul>
</div>
`;
const todosList = document.getElementById("todos") as HTMLUListElement;
const todoInput = document.getElementById("todo-input") as HTMLInputElement;
const newTodoForm = document.getElementById("new-todo-form") as HTMLFormElement;

export function setupVanillaHtmlJsRenderer() {
  const todoActions: TodoActions = {
    "React to todo entering SAVING state": () => {
      const saveMessage = document.createElement("p");
      saveMessage.textContent = "Saving...";
      saveMessage.id = "save-message";
      vanillaRoot.appendChild(saveMessage);
      todoInput.disabled = true;
    },
    "React to todo entering READING state": () => {
      todoInput.disabled = false;
      const saveMessage = document.getElementById("save-message");
      if (saveMessage) {
        saveMessage.remove();
      }
    },
    "React to todo updating it's label": ({ context, self }) => {
      const todo = document.getElementById(self.id)! as HTMLLIElement;
      todo.textContent = context.label;
    },
    "React to todo canceling it's label update": ({ context, self }) => {
      const todo = document.getElementById(self.id)! as HTMLLIElement;
      todo.textContent = context.previousLabel;
    },
  };

  const todosActions: TodosActions = {
    "React to new todo update": ({ context }) => {
      todoInput.value = context.newTodoLabel;
    },
    "React to todo addition": ({ context }) => {
      const newTodo = document.createElement("li");
      const todoActor = context.todos[context.todos.length - 1]!;
      const todoSnapshot = todoActor.getSnapshot();
      newTodo.textContent = todoSnapshot.context.label;
      newTodo.id = todoActor.id;
      todoInput.value = context.newTodoLabel;
      todosList.appendChild(newTodo);
    },
    "React to todo deletion": (_, todoId) => {
      const todoToDelete = document.getElementById(todoId)!;
      todoToDelete.remove();
    },
    "React to enter DISABLED": () => {
      vanillaRoot.style.display = "none";
    },
    "React to enter ENABLED": () => {
      vanillaRoot.style.display = "initial";
    },
  };

  return {
    provideTodoActionsWith: todoActions,
    provideTodosActionsWith: todosActions,
    setupEventsWithActor: (todosActor: TodosActor) => {
      newTodoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        todosActor.send({ type: "Add a todo" });
      });
      newTodoForm.addEventListener("input", () => {
        todosActor.send({
          type: "Update new todo's label",
          label: todoInput.value,
        });
      });
    },
  };
}
