import "./App.css";

function App() {
  // 1. VARIABLES AND DATA TYPES
  const name = "Anna";
  let age = 21;
  const active = true;
  const courses = ["JavaScript", "React", "Geology"];
  const address = { city: "Almaty", street: "Abay" };

  const emptyValue = null;
  let undefinedValue;

  const sentence = `${name} is ${age} years old and studies ${courses[0]}.`;

  // 2. ARRAYS
  const numbers = [3, 7, 2, 10, 5];

  const doubled = numbers.map((number) => number * 2);
  const greaterThanFive = numbers.filter((number) => number > 5);
  const firstGreaterThanFive = numbers.find((number) => number > 5);
  const sum = numbers.reduce((total, number) => total + number, 0);
  const hasTen = numbers.includes(10);

  // 3. ARRAYS OF OBJECTS
  const students = [
    { id: 1, name: "Anna", grade: 85 },
    { id: 2, name: "John", grade: 62 },
    { id: 3, name: "Sara", grade: 91 },
    { id: 4, name: "Mike", grade: 55 },
  ];

  const goodStudents = students.filter((student) => student.grade >= 70);

  const studentNames = students.map((student) => student.name);

  const studentId3 = students.find((student) => student.id === 3);

  const topStudent = students.reduce((top, student) =>
    student.grade > top.grade ? student : top
  );

  const averageGrade =
    students.reduce((total, student) => total + student.grade, 0) /
    students.length;

  const studentsWithPassed = students.map((student) => ({
    ...student,
    passed: student.grade >= 60,
  }));

  // 4. OBJECTS AND DESTRUCTURING
  const user = {
    id: 1,
    name: "Anna",
    age: 21,

    address: {
      city: "Almaty",
      street: "Abay",
    },
  };

  const userName = user.name;
  const userCity = user.address.city;

  const changedUser = {
    ...user,
    age: 22,
    email: "anna@example.com",

    address: {
      city: user.address.city,
    },
  };

  const {
    name: destructuredName,
    age: destructuredAge,
  } = changedUser;

  const {
    address: { city: destructuredCity },
  } = changedUser;

  // 5. VALUES AND REFERENCES
  const original = {
    name: "Alice",
    score: 10,
  };

  const sameReference = original;

  sameReference.score = 20;

  const spreadCopy = {
    ...original,
  };

  spreadCopy.score = 30;

  const nestedUser = {
    name: "Alice",

    address: {
      city: "Almaty",
    },
  };

  const shallowCopy = {
    ...nestedUser,
  };

  shallowCopy.address.city = "Astana";

  const deepEnoughCopy = {
    ...nestedUser,

    address: {
      ...nestedUser.address,
    },
  };

  deepEnoughCopy.address.city = "Shymkent";

  // 6. FUNCTIONS
  function isEven(number) {
    return number % 2 === 0;
  }

  const getFullName = (firstName, lastName) =>
    `${firstName} ${lastName}`;

  const calculatePrice = (price, quantity) =>
    price * quantity;

  const calculateDiscount = (price, percent) =>
    price - (price * percent) / 100;

  const getMax = (a, b) =>
    Math.max(a, b);

  // 7. FUNCTIONS AS VALUES
  const add = (a, b) =>
    a + b;

  const multiply = (a, b) =>
    a * b;

  const calculate = (a, b, operation) =>
    operation(a, b);

  // 8. SCOPE
  const globalMessage = "global";

  function scopeExample() {
    const functionMessage = "function";

    let blockMessage = "block";

    if (true) {
      blockMessage = "block";
    }

    return `${globalMessage} → ${functionMessage} → ${blockMessage}`;
  }

  // 9. CLOSURE
  function createCounter() {
    let count = 0;

    return function () {
      count += 1;
      return count;
    };
  }

  const counter = createCounter();

  function createAdder(value) {
    return function (number) {
      return value + number;
    };
  }

  const addFive = createAdder(5);

  // 10. DESTRUCTURING, SPREAD AND REST
  const nums = [10, 20, 30, 40];

  const [first, second] = nums;

  const person = {
    id: 1,
    name: "Anna",
    age: 21,
  };

  const {
    name: personName,
    age: personAge,
  } = person;

  const newNumbers = [
    ...nums,
    50,
  ];

  const newUser = {
    ...person,
    age: 22,
  };

  const userWithEmail = {
    ...person,
    email: "anna@example.com",
  };

  const arrayA = [1, 2];
  const arrayB = [3, 4];

  const combinedArrays = [
    ...arrayA,
    ...arrayB,
  ];

  function sumAll(...numbersToSum) {
    return numbersToSum.reduce(
      (total, number) => total + number,
      0
    );
  }

  // 11. OPTIONAL CHAINING AND DEFAULT VALUES
  const userWithAddress = {
    name: "Anna",

    address: {
      city: "Almaty",
    },
  };

  const userWithoutAddress = {
    name: "John",
  };

  const cityOne =
    userWithAddress.address?.city;

  const cityTwo =
    userWithoutAddress.address?.city ??
    "City not specified";

  // FINAL TASK
  const classList = [
    {
      id: 1,
      name: "Anna",
      age: 20,
      grades: [80, 90, 85],
    },

    {
      id: 2,
      name: "John",
      age: 21,
      grades: [60, 70, 65],
    },

    {
      id: 3,
      name: "Sara",
      age: 20,
      grades: [95, 92, 98],
    },

    {
      id: 4,
      name: "Mike",
      age: 22,
      grades: [50, 55, 60],
    },

    {
      id: 5,
      name: "Lena",
      age: 21,
      grades: [75, 80, 78],
    },
  ];

  const getAverage = (grades) =>
    grades.reduce(
      (total, grade) => total + grade,
      0
    ) / grades.length;

  const getStudentAverage = (student) =>
    getAverage(student.grades);

  const getPassedStudents = (studentList) =>
    studentList.filter(
      (student) =>
        getStudentAverage(student) >= 60
    );

  const getStudentNames = (studentList) =>
    studentList.map(
      (student) => student.name
    );

  const findStudent = (studentList, id) =>
    studentList.find(
      (student) => student.id === id
    );

  const getTopStudent = (studentList) =>
    studentList.reduce(
      (top, student) =>
        getStudentAverage(student) >
        getStudentAverage(top)
          ? student
          : top
    );

  const finalSummary = classList.map(
    (student) => ({
      id: student.id,
      name: student.name,

      average: Number(
        getStudentAverage(student).toFixed(2)
      ),

      passed:
        getStudentAverage(student) >= 60,
    })
  );

  return (
    <main className="page">

      <header className="hero-card">
        <span className="hero-small">
          JavaScript Refresher
        </span>

        <h1>React & JavaScript Tasks</h1>

        <p>
          Bagauova Danara • 23B031233
        </p>
      </header>

      {/* TASK 1 */}
      <section className="code-card">

        <div className="task-number">
          Task 01
        </div>

        <h2>
          Variables and Data Types
        </h2>

        <div className="result-box">

          <p>
            <b>Name:</b> {name}
          </p>

          <p>
            <b>Age:</b> {age}
          </p>

          <p>
            <b>Active:</b>{" "}
            {String(active)}
          </p>

          <p>
            <b>Courses:</b>{" "}
            {courses.join(", ")}
          </p>

          <p>
            <b>City:</b>{" "}
            {address.city}
          </p>

          <p>
            <b>typeof name:</b>{" "}
            {typeof name}
          </p>

          <p>
            <b>typeof age:</b>{" "}
            {typeof age}
          </p>

          <p>
            <b>typeof active:</b>{" "}
            {typeof active}
          </p>

          <p>
            <b>typeof null:</b>{" "}
            {typeof emptyValue}
          </p>

          <p>
            <b>typeof undefined:</b>{" "}
            {typeof undefinedValue}
          </p>

          <p>
            <b>Template literal:</b>{" "}
            {sentence}
          </p>

        </div>

        <div className="understanding-box">
          <p>
            В этом задании я разобралась
            с основными типами данных в
            JavaScript. Здесь используются
            let и const для переменных,
            а также string, number, boolean,
            array, object, null и undefined.
            Ещё я попробовала typeof и
            template literal для создания
            строки.
          </p>
        </div>

      </section>

      {/* TASK 2 */}
      <section className="code-card">

        <div className="task-number">
          Task 02
        </div>

        <h2>Arrays</h2>

        <p className="description">
          Original array:
          [3, 7, 2, 10, 5]
        </p>

        <div className="grid clean-grid">

          <div>
            <span>map</span>
            <strong>
              {doubled.join(", ")}
            </strong>
          </div>

          <div>
            <span>filter</span>
            <strong>
              {greaterThanFive.join(", ")}
            </strong>
          </div>

          <div>
            <span>find</span>
            <strong>
              {firstGreaterThanFive}
            </strong>
          </div>

          <div>
            <span>reduce</span>
            <strong>
              {sum}
            </strong>
          </div>

          <div>
            <span>includes(10)</span>
            <strong>
              {String(hasTen)}
            </strong>
          </div>

        </div>

        <div className="understanding-box">
          <p>
            Здесь я работала с методами
            массивов. map создаёт новый
            массив с изменёнными значениями,
            filter отбирает элементы по
            условию, find находит первый
            подходящий элемент, reduce
            объединяет значения в один
            результат, а includes проверяет
            наличие элемента.
          </p>
        </div>

      </section>

      {/* TASK 3 */}
      <section className="code-card">

        <div className="task-number">
          Task 03
        </div>

        <h2>
          Arrays of Objects
        </h2>

        <div className="result-box">

          <p>
            <b>Grade ≥ 70:</b>{" "}
            {goodStudents
              .map((student) => student.name)
              .join(", ")}
          </p>

          <p>
            <b>Names:</b>{" "}
            {studentNames.join(", ")}
          </p>

          <p>
            <b>ID 3:</b>{" "}
            {studentId3.name}
          </p>

          <p>
            <b>Highest grade:</b>{" "}
            {topStudent.name} (
            {topStudent.grade})
          </p>

          <p>
            <b>Average grade:</b>{" "}
            {averageGrade.toFixed(2)}
          </p>

        </div>

        <div className="student-list">

          {studentsWithPassed.map(
            (student) => (

              <div
                className="student"
                key={student.id}
              >

                <strong>
                  {student.name}
                </strong>

                <span>
                  Grade: {student.grade}
                </span>

                <span>
                  Passed:{" "}
                  {String(student.passed)}
                </span>

              </div>

            )
          )}

        </div>

        <div className="understanding-box">
          <p>
            На этом примере я научилась
            работать уже не просто с
            массивом, а с массивом объектов.
            С помощью filter, map, find и
            reduce можно отбирать студентов,
            получать их имена, искать по ID,
            считать средний балл и находить
            студента с самой высокой оценкой.
          </p>
        </div>

      </section>

      {/* TASK 4 */}
      <section className="code-card">

        <div className="task-number">
          Task 04
        </div>

        <h2>
          Objects and Destructuring
        </h2>

        <div className="result-box">

          <p>
            <b>Name:</b> {userName}
          </p>

          <p>
            <b>City:</b> {userCity}
          </p>

          <p>
            <b>Changed age:</b>{" "}
            {changedUser.age}
          </p>

          <p>
            <b>Added email:</b>{" "}
            {changedUser.email}
          </p>

          <p>
            <b>Destructured name:</b>{" "}
            {destructuredName}
          </p>

          <p>
            <b>Destructured age:</b>{" "}
            {destructuredAge}
          </p>

          <p>
            <b>Nested city:</b>{" "}
            {destructuredCity}
          </p>

        </div>

        <div className="understanding-box">
          <p>
            В этой части стало понятнее,
            как работать с объектами и их
            свойствами. Через spread можно
            создать копию объекта и изменить
            нужные значения, а destructuring
            позволяет удобно доставать
            отдельные свойства, в том числе
            из вложенных объектов.
          </p>
        </div>

      </section>

      {/* TASK 5 */}
      <section className="code-card">

        <div className="task-number">
          Task 05
        </div>

        <h2>
          Values and References
        </h2>

        <div className="result-box">

          <p>
            <b>
              Original score:
            </b>{" "}
            {original.score}
          </p>

          <p>
            <b>
              Spread copy score:
            </b>{" "}
            {spreadCopy.score}
          </p>

          <p>
            <b>
              Shallow copy city:
            </b>{" "}
            {nestedUser.address.city}
          </p>

          <p>
            <b>
              Separate nested copy:
            </b>{" "}
            {deepEnoughCopy.address.city}
          </p>

        </div>

        <div className="understanding-box">
          <p>
            Этот пример показал мне разницу
            между значением и ссылкой.
            Если просто присвоить объект
            другой переменной, обе переменные
            будут ссылаться на один объект.
            Spread создаёт новую копию,
            но для вложенных объектов одного
            spread недостаточно.
          </p>
        </div>

      </section>

      {/* TASK 6 */}
      <section className="code-card">

        <div className="task-number">
          Task 06
        </div>

        <h2>Functions</h2>

        <div className="grid clean-grid">

          <div>
            <span>isEven(8)</span>
            <strong>
              {String(isEven(8))}
            </strong>
          </div>

          <div>
            <span>Full name</span>
            <strong>
              {getFullName(
                "Anna",
                "Smith"
              )}
            </strong>
          </div>

          <div>
            <span>Price</span>
            <strong>
              {calculatePrice(10, 3)}
            </strong>
          </div>

          <div>
            <span>20% discount</span>
            <strong>
              {calculateDiscount(
                100,
                20
              )}
            </strong>
          </div>

          <div>
            <span>Max(7, 11)</span>
            <strong>
              {getMax(7, 11)}
            </strong>
          </div>

        </div>

        <div className="understanding-box">
          <p>
            Здесь я потренировалась
            создавать разные функции.
            Функции могут принимать
            параметры, выполнять с ними
            действия и возвращать результат.
            Также я увидела разницу в записи
            обычной функции и arrow function.
          </p>
        </div>

      </section>

      {/* TASK 7 */}
      <section className="code-card">

        <div className="task-number">
          Task 07
        </div>

        <h2>
          Functions as Values
        </h2>

        <div className="grid clean-grid">

          <div>
            <span>
              calculate + add
            </span>

            <strong>
              {calculate(
                5,
                3,
                add
              )}
            </strong>
          </div>

          <div>
            <span>
              calculate + multiply
            </span>

            <strong>
              {calculate(
                5,
                3,
                multiply
              )}
            </strong>
          </div>

        </div>

        <div className="understanding-box">
          <p>
            Из этого задания я узнала,
            что функцию можно хранить
            в переменной и передавать
            в другую функцию как аргумент.
            Поэтому одна функция calculate
            может выполнять разные действия
            в зависимости от переданной
            ей операции.
          </p>
        </div>

      </section>

      {/* TASK 8 */}
      <section className="code-card">

        <div className="task-number">
          Task 08
        </div>

        <h2>Scope</h2>

        <div className="result-box">

          <p>
            <b>Scope order:</b>{" "}
            {scopeExample()}
          </p>

        </div>

        <div className="scope-table">

          <div>
            <strong>var</strong>
            <span>function scope</span>
            <span>can reassign</span>
          </div>

          <div>
            <strong>let</strong>
            <span>block scope</span>
            <span>can reassign</span>
          </div>

          <div>
            <strong>const</strong>
            <span>block scope</span>
            <span>cannot reassign</span>
          </div>

        </div>

        <div className="understanding-box">
          <p>
            Здесь показано, как работает
            область видимости переменных.
            Global переменная доступна шире,
            function scope ограничивается
            функцией, а block scope работает
            внутри блока. Также здесь видно
            различие между var, let и const.
          </p>
        </div>

      </section>

      {/* TASK 9 */}
      <section className="code-card">

        <div className="task-number">
          Task 09
        </div>

        <h2>Closure</h2>

        <div className="result-box">

          <p>
            <b>Counter calls:</b>{" "}
            {counter()}, {counter()},{" "}
            {counter()}
          </p>

          <p>
            <b>New counter:</b>{" "}
            {createCounter()()}
          </p>

          <p>
            <b>addFive(10):</b>{" "}
            {addFive(10)}
          </p>

          <p>
            <b>addFive(20):</b>{" "}
            {addFive(20)}
          </p>

        </div>

        <div className="understanding-box">
          <p>
            На примере counter я увидела
            принцип closure. Внутренняя
            функция продолжает помнить
            переменную count даже после
            завершения внешней функции,
            поэтому значение не сбрасывается
            при каждом новом вызове.
          </p>
        </div>

      </section>

      {/* TASK 10 */}
      <section className="code-card">

        <div className="task-number">
          Task 10
        </div>

        <h2>
          Destructuring, Spread and Rest
        </h2>

        <div className="result-box">

          <p>
            <b>First two numbers:</b>{" "}
            {first}, {second}
          </p>

          <p>
            <b>Person:</b>{" "}
            {personName}, age {personAge}
          </p>

          <p>
            <b>New numbers:</b>{" "}
            {newNumbers.join(", ")}
          </p>

          <p>
            <b>New user age:</b>{" "}
            {newUser.age}
          </p>

          <p>
            <b>User email:</b>{" "}
            {userWithEmail.email}
          </p>

          <p>
            <b>Combined arrays:</b>{" "}
            {combinedArrays.join(", ")}
          </p>

          <p>
            <b>sumAll(1, 2):</b>{" "}
            {sumAll(1, 2)}
          </p>

          <p>
            <b>
              sumAll(1, 2, 3, 4):
            </b>{" "}
            {sumAll(1, 2, 3, 4)}
          </p>

        </div>

        <div className="understanding-box">
          <p>
            В этой части я использовала
            сразу несколько способов работы
            с данными. Destructuring помогает
            доставать нужные значения,
            spread используется для
            копирования и объединения,
            а rest собирает несколько
            переданных аргументов в один
            массив.
          </p>
        </div>

      </section>

      {/* TASK 11 */}
      <section className="code-card">

        <div className="task-number">
          Task 11
        </div>

        <h2>
          Optional Chaining and Default Values
        </h2>

        <div className="result-box">

          <p>
            <b>Existing city:</b>{" "}
            {cityOne}
          </p>

          <p>
            <b>Missing city:</b>{" "}
            {cityTwo}
          </p>

          <p>
            0 || "default" → default
          </p>

          <p>
            0 ?? "default" → 0
          </p>

          <p>
            "" || "default" → default
          </p>

          <p>
            "" ?? "default" → empty string
          </p>

          <p>
            false || "default" → default
          </p>

          <p>
            false ?? "default" → false
          </p>

        </div>

        <div className="understanding-box">
          <p>
            Здесь я разобралась с optional
            chaining и значениями по
            умолчанию. Оператор ?. позволяет
            безопасно обратиться к свойству,
            которого может не быть, а ??
            подставляет другое значение
            только если результат равен
            null или undefined.
          </p>
        </div>

      </section>

      {/* FINAL TASK */}
      <section className="code-card final-card">

        <div className="task-number">
          Final
        </div>

        <h2>Final Task</h2>

        <div className="result-box">

          <p>
            <b>Passed students:</b>{" "}
            {getPassedStudents(classList)
              .map(
                (student) =>
                  student.name
              )
              .join(", ")}
          </p>

          <p>
            <b>Student names:</b>{" "}
            {getStudentNames(
              classList
            ).join(", ")}
          </p>

          <p>
            <b>Find ID 3:</b>{" "}
            {findStudent(
              classList,
              3
            ).name}
          </p>

          <p>
            <b>Top student:</b>{" "}
            {getTopStudent(
              classList
            ).name}
          </p>

        </div>

        <h3 className="summary-title">
          Final Summary
        </h3>

        <div className="student-list">

          {finalSummary.map(
            (student) => (

              <div
                className="student"
                key={student.id}
              >

                <strong>
                  {student.name}
                </strong>

                <span>
                  Average:{" "}
                  {student.average}
                </span>

                <span>
                  Passed:{" "}
                  {String(
                    student.passed
                  )}
                </span>

              </div>

            )
          )}

        </div>

        <div className="understanding-box">
          <p>
            В финальном задании получилось
            применить сразу несколько
            изученных методов вместе.
            Функции считают средний балл,
            фильтруют студентов, ищут нужного
            по ID и определяют лучшего
            студента. В конце создаётся новый
            массив с итоговой информацией,
            при этом исходный массив
            не изменяется.
          </p>
        </div>

      </section>

    </main>
  );
}

export default App;