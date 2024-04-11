import { assert, expect, test, vi } from "vitest";

import { TodoSnapshot, todoMachine } from "./todo.machine";
import { createActor, fromPromise } from "xstate";

test("Edit a todo", () => {
  const saveTodo = vi.fn(() => async () => {
    return true;
  });
  const todoActor = createActor(
    todoMachine.provide({
      actors: {
        "Save todo on server": fromPromise(saveTodo as unknown as any),
        "Log save operation": fromPromise(async () => {
          return true;
        }),
      },
    }),
    {
      input: { label: "Buy milk" },
    }
  );

  function* testPlanBuilder(): Generator<void, void, TodoSnapshot> {
    let snapshot = yield;
    assert.isTrue(snapshot.matches({ UPDATE: "READING" }));
    todoActor.send({ type: "Edit todo" });

    snapshot = yield;
    assert.isTrue(snapshot.matches({ UPDATE: "EDITING" }));
    todoActor.send({
      type: "Update label",
      label: "Buy milk and eggs",
    });

    snapshot = yield;
    expect(snapshot.context.label).toBe("Buy milk and eggs");
    todoActor.send({ type: "Cancel" });

    snapshot = yield;
    expect(snapshot.context.label).toBe("Buy milk");
    assert.isTrue(snapshot.matches({ UPDATE: "READING" }));
    todoActor.send({ type: "Edit todo" });

    snapshot = yield;
    assert.isTrue(snapshot.matches({ UPDATE: "EDITING" }));
    todoActor.send({
      type: "Update label",
      label: "Buy milk and eggs",
    });

    snapshot = yield;
    expect(snapshot.context.label).toBe("Buy milk and eggs");
    todoActor.send({ type: "Save todo" });

    snapshot = yield;
    assert.isTrue(snapshot.matches({ UPDATE: "SAVING" }));

    snapshot = yield;
    snapshot = yield;

    expect(saveTodo).toBeCalledTimes(1);
    assert.isTrue(snapshot.matches({ UPDATE: "READING" }));
    expect(snapshot.context.previousLabel).toBe("Buy milk and eggs");
  }

  return new Promise<void>((resolve, reject) => {
    const testPlan = testPlanBuilder();
    testPlan.next();
    todoActor.subscribe({
      next(snapshot) {
        try {
          const { done } = testPlan.next(snapshot);
          if (done) {
            return resolve();
          }
        } catch (error) {
          reject(error);
        }
      },
    });

    todoActor.start();
  });
});
