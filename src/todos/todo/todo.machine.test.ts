import { expect, test } from "vitest";

import { TodoSnapshot, todoMachine } from "./todo.machine";
import { createActor, fromPromise } from "xstate";
import { i } from "vitest/dist/reporters-P7C2ytIv.js";

test("Edit a todo", () => {
  const todoActor = createActor(
    todoMachine.provide({
      actors: {
        "Save todo": fromPromise(async () => {
          return true;
        }),
      },
    }),
    {
      input: { label: "Buy milk" },
    }
  );

  function* testPlanBuilder(): Generator<void, void, TodoSnapshot> {
    console.log("testPlanBuilder");

    let snapshot = yield;
    expect(snapshot.value).toBe("READING");
    todoActor.send({ type: "Edit todo" });

    snapshot = yield;
    expect(snapshot.value).toBe("EDITING");
    todoActor.send({
      type: "Update label",
      label: "Buy milk and eggs",
    });

    snapshot = yield;
    expect(snapshot.context.label).toBe("Buy milk and eggs");
    todoActor.send({ type: "Cancel" });

    snapshot = yield;
    expect(snapshot.context.label).toBe("Buy milk");
    expect(snapshot.value).toBe("READING");

    todoActor.send({ type: "Edit todo" });
    snapshot = yield;
    expect(snapshot.value).toBe("EDITING");
    todoActor.send({
      type: "Update label",
      label: "Buy milk and eggs",
    });

    snapshot = yield;
    expect(snapshot.context.label).toBe("Buy milk and eggs");
    todoActor.send({ type: "Save todo" });

    snapshot = yield;
    expect(snapshot.value).toBe("SAVING");

    snapshot = yield;
    expect(snapshot.value).toBe("READING");
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

  // expect(todoActor.getSnapshot().value).toMatch("READING");
  // todoActor.send({ type: "Edit todo" });
  // expect(todoActor.getSnapshot().value).toMatch("EDITING");
  // todoActor.send({ type: "Update label", label: "Buy milk and eggs" });
  // expect(todoActor.getSnapshot().context.label).toMatch("Buy milk and eggs");
  // todoActor.send({ type: "Save todo" });
  // expect(todoActor.getSnapshot().value).toMatch("SAVING");
  // const a = todoActor.subscribe((state) => {
  //   expect(todoActor.getSnapshot().value).toMatch("READING");
  //   expect(todoActor.getSnapshot().context.previousLabel).toMatch(
  //     "Buy milk and eggs"
  //   );
  // });
  // a.
});
