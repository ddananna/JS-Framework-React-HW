# Async Task Lab

This project uses HTML, CSS, and JavaScript to simulate loading users,
posts, and comments. Open index.html to run it.

## Closures
Each task has a private counter inside createTask().
run(), getCount(), and reset() can access it through a closure.
Every task has its own counter.

## Call stack and timers
When run() calls renderTasks(), renderTasks() finishes first.
setTimeout() schedules a callback, so JavaScript can do other work
while the timer waits.

## Promises and errors
Tasks take 500–2000 ms and sometimes fail.
resolve() returns success, and reject() returns an error.
I use try/catch for individual errors and Promise.allSettled()
to wait for all tasks, even if some fail.

## Sequential and concurrent
Sequential execution waits for each task before starting the next.
Its time is roughly the sum of the delays.
Concurrent execution starts all tasks together.
Its time is roughly the longest delay.

## Event loop
Expected output:
1. Script start
2. Async start
3. Script end
4. Promise 1
5. Promise 2
6. Async after await
7. Timer 1
8. Timer 2

The demo produces this order.
Synchronous code runs first. Then microtasks run:
Promise callbacks and the code after await.
Timer callbacks run afterward as tasks.
The event loop processes microtasks before moving to the next task.