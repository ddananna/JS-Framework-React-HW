import { useState } from "react";
import "./App.css";

const statuses = ["Not started", "In progress", "Completed"];

const startingCourses = [
  {
    id: "geology",
    title: "Geology",
    category: "Earth science",
    status: "In progress",
    version: 0,
  },
  {
    id: "react",
    title: "React",
    category: "Programming",
    status: "Not started",
    version: 0,
  },
  {
    id: "physics",
    title: "Physics",
    category: "Science",
    status: "Completed",
    version: 0,
  },
];

function AddCourse({ onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Science");

  console.log("AddCourse rendered");

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) return;

    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      status: "Not started",
      version: 0,
    });

    setTitle("");
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label>
        Course name
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="For example, Mathematics"
          maxLength={60}
          required
        />
      </label>

      <label>
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>Science</option>
          <option>Earth science</option>
          <option>Programming</option>
          <option>Languages</option>
          <option>Other</option>
        </select>
      </label>

      <button className="primary" type="submit">
        + Add course
      </button>
    </form>
  );
}

function CourseCard({ course, visible, onStatusChange, onDelete, onReset }) {
  const [sessions, setSessions] = useState(0);

  console.log(
    `CourseCard rendered: ${course.title}, sessions: ${sessions}`
  );

  return (
    <article className="course-card" hidden={!visible}>
      <div className="card-heading">
        <span className="category">{course.category}</span>

        <button
          className="delete"
          onClick={() => onDelete(course.id)}
          aria-label={`Delete ${course.title}`}
        >
          Delete
        </button>
      </div>

      <h2>{course.title}</h2>

      <label>
        Status
        <select
          value={course.status}
          onChange={(event) =>
            onStatusChange(course.id, event.target.value)
          }
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>

      <div className="session-box">
        <span>Study sessions</span>
        <strong>{sessions}</strong>

        <p>
          {sessions === 0
            ? "Ready for your first session?"
            : "Nice work! Keep learning."}
        </p>
      </div>

      <div className="card-actions">
        <button
          className="primary"
          onClick={() => setSessions((count) => count + 1)}
        >
          + Study session
        </button>

        <button onClick={() => onReset(course.id)}>
          Reset
        </button>
      </div>

      {course.status === "Completed" && (
        <p className="completed">✓ Course completed</p>
      )}
    </article>
  );
}

export default function App() {
  const [courses, setCourses] = useState(startingCourses);
  const [filter, setFilter] = useState("All");

  console.log("App rendered");

  function addCourse(course) {
    setCourses((previous) => [...previous, course]);
  }

  function deleteCourse(id) {
    setCourses((previous) =>
      previous.filter((course) => course.id !== id)
    );
  }

  function changeStatus(id, status) {
    setCourses((previous) =>
      previous.map((course) =>
        course.id === id ? { ...course, status } : course
      )
    );
  }

  function resetCourse(id) {
    setCourses((previous) =>
      previous.map((course) =>
        course.id === id
          ? { ...course, version: course.version + 1 }
          : course
      )
    );
  }

  function reverseCourses() {
    setCourses((previous) => [...previous].reverse());
  }

  const completedCount = courses.filter(
    (course) => course.status === "Completed"
  ).length;

  const visibleCount = courses.filter(
    (course) => filter === "All" || course.status === filter
  ).length;

  return (
    <main className="dashboard">
      <header>
        <span className="eyebrow">MY LEARNING SPACE</span>
        <h1>Study Dashboard</h1>
        <p>Organize your courses and track your study sessions.</p>
      </header>

      <section className="stats" aria-label="Course statistics">
        <div>
          <span>Total courses</span>
          <strong>{courses.length}</strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>

        <div>
          <span>Still learning</span>
          <strong>{courses.length - completedCount}</strong>
        </div>
      </section>

      <section className="panel" aria-labelledby="add-title">
        <h2 id="add-title">Add a new course</h2>
        <AddCourse onAdd={addCourse} />
      </section>

      <section aria-labelledby="courses-title">
        <div className="toolbar">
          <h2 id="courses-title">My courses ({visibleCount})</h2>

          <div className="filters">
            <label>
              Filter by status
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option>All</option>

                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <button onClick={reverseCourses}>
              Reverse order
            </button>
          </div>
        </div>

        {visibleCount === 0 && (
          <p className="empty">
            {courses.length === 0
              ? "No courses yet. Add your first course above."
              : "No courses match this filter."}
          </p>
        )}

        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={`${course.id}-${course.version}`}
              course={course}
              visible={filter === "All" || course.status === filter}
              onStatusChange={changeStatus}
              onDelete={deleteCourse}
              onReset={resetCourse}
            />
          ))}
        </div>
      </section>
    </main>
  );
}