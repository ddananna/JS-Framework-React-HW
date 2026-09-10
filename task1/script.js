const $ = (selector) => document.querySelector(selector);
const randomDelay = () => Math.floor(Math.random() * 1501) + 500;

let busy = false;

function createTask(name) {
  let count = 0;
  let status = "Idle";
  let loadingTime = 0;
  let error = "";

  return {
    name,

    getCount() {
      return count;
    },

    getState() {
      return { status, loadingTime, error };
    },

    run(delay = randomDelay(), shouldFail = Math.random() < 0.25) {
      if (status === "Running") {
        return Promise.reject(new Error(`${name} is already running.`));
      }

      count++;
      status = "Running";
      loadingTime = 0;
      error = "";

      const started = performance.now();
      renderTasks();

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          loadingTime = Math.round(performance.now() - started);

          if (shouldFail) {
            status = "Failed";
            error = "Simulated loading error. Try again.";
            renderTasks();
            reject(new Error(`${name} failed.`));
          } else {
            status = "Completed";
            renderTasks();
            resolve(`${name} completed.`);
          }
        }, delay);
      });
    },

    reset() {
      if (status === "Running") return;

      count = 0;
      status = "Idle";
      loadingTime = 0;
      error = "";
      renderTasks();
    }
  };
}

const tasks = [
  createTask("Load Users"),
  createTask("Load Posts"),
  createTask("Load Comments")
];

function renderTasks() {
  $("#tasks").innerHTML = tasks.map((task, index) => {
    const state = task.getState();

    return `
      <article>
        <h3>${task.name}</h3>
        <span class="status ${state.status.toLowerCase()}">
          ${state.status}
        </span>
        <p>Execution count: <b>${task.getCount()}</b></p>
        <p>Loading time: <b>${state.loadingTime} ms</b></p>
        ${state.error ? `<p class="error">${state.error}</p>` : ""}
        <div class="actions">
          <button data-run="${index}" ${busy ? "disabled" : ""}>
            Run Task
          </button>
          <button
            class="secondary"
            data-reset="${index}"
            ${busy ? "disabled" : ""}
          >
            Reset
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function setBusy(value) {
  busy = value;

  $("#run-all").disabled = value;
  $("#compare").disabled = value;
  $("#reset-all").disabled = value;

  renderTasks();
}

function finishedMessage(results) {
  const failed = results.filter(
    (result) => result.status === "rejected"
  ).length;

  return `All tasks finished. ${results.length - failed} completed, ${failed} failed.`;
}

$("#tasks").addEventListener("click", async (event) => {
  const button = event.target.closest("button");

  if (!button || busy) return;

  if (button.hasAttribute("data-reset")) {
    const task = tasks[Number(button.dataset.reset)];
    task.reset();
    $("#message").textContent = `${task.name} reset.`;
    return;
  }

  if (button.hasAttribute("data-run")) {
    const task = tasks[Number(button.dataset.run)];
    setBusy(true);
    $("#message").textContent = `${task.name} is running...`;

    try {
      $("#message").textContent = await task.run();
    } catch (error) {
      $("#message").textContent = error.message;
    } finally {
      setBusy(false);
    }
  }
});

$("#run-all").addEventListener("click", async () => {
  if (busy) return;

  setBusy(true);
  $("#message").textContent = "All tasks are running concurrently...";

  const started = performance.now();

  try {
    const results = await Promise.allSettled(
      tasks.map((task) => task.run())
    );

    const elapsed = Math.round(performance.now() - started);
    $("#concurrent-time").textContent = `${elapsed} ms`;
    $("#message").textContent = finishedMessage(results);
  } finally {
    setBusy(false);
  }
});

$("#compare").addEventListener("click", async () => {
  if (busy) return;

  setBusy(true);
  $("#sequential-time").textContent = "…";
  $("#concurrent-time").textContent = "…";
  $("#comparison").textContent = "Comparison in progress...";

  const settings = tasks.map(() => ({
    delay: randomDelay(),
    shouldFail: Math.random() < 0.25
  }));

  try {
    $("#message").textContent = "Running tasks sequentially...";
    let started = performance.now();
    const sequentialResults = [];

    for (let index = 0; index < tasks.length; index++) {
      try {
        const value = await tasks[index].run(
          settings[index].delay,
          settings[index].shouldFail
        );

        sequentialResults.push({ status: "fulfilled", value });
      } catch (reason) {
        sequentialResults.push({ status: "rejected", reason });
      }
    }

    const sequentialTime = Math.round(performance.now() - started);
    $("#sequential-time").textContent = `${sequentialTime} ms`;

    $("#message").textContent = "Running tasks concurrently...";
    started = performance.now();

    const concurrentResults = await Promise.allSettled(
      tasks.map((task, index) =>
        task.run(settings[index].delay, settings[index].shouldFail)
      )
    );

    const concurrentTime = Math.round(performance.now() - started);
    $("#concurrent-time").textContent = `${concurrentTime} ms`;

    $("#message").textContent =
      `Sequential: ${finishedMessage(sequentialResults)} ` +
      `Concurrent: ${finishedMessage(concurrentResults)}`;

    $("#comparison").textContent =
      `Same delays in both runs: ${settings.map((s) => s.delay).join(", ")} ms. ` +
      `Sequential time is approximately the sum of the delays. ` +
      `Concurrent time is approximately the longest delay because waits overlap. ` +
      `Each task ran twice.`;
  } finally {
    setBusy(false);
  }
});

$("#reset-all").addEventListener("click", () => {
  if (busy) return;

  tasks.forEach((task) => task.reset());

  $("#sequential-time").textContent = "—";
  $("#concurrent-time").textContent = "—";
  $("#comparison").textContent =
    "Compare both methods using the same simulated delays.";
  $("#message").textContent = "All tasks reset.";
});

const expectedOutput = [
  "1. Script start",
  "2. Async start",
  "3. Script end",
  "4. Promise 1",
  "5. Promise 2",
  "6. Async after await",
  "7. Timer 1",
  "8. Timer 2"
];

$("#expected").textContent = expectedOutput.join("\n");

$("#event-demo").addEventListener("click", () => {
  const button = $("#event-demo");
  button.disabled = true;
  $("#actual").textContent = "";

  function log(message) {
    console.log(message);
    $("#actual").textContent += `${message}\n`;
  }

  log("1. Script start");

  setTimeout(() => {
    log("7. Timer 1");
  }, 0);

  setTimeout(() => {
    log("8. Timer 2");
    button.disabled = false;
  }, 0);

  Promise.resolve().then(() => {
    log("4. Promise 1");
  });

  Promise.resolve().then(() => {
    log("5. Promise 2");
  });

  async function asyncExample() {
    log("2. Async start");
    await Promise.resolve();
    log("6. Async after await");
  }

  asyncExample();

  log("3. Script end");
});

renderTasks();