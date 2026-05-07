import { useState, useEffect } from "react";
import "./App.css";

function App() {
  //login
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  //Tasks
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  //Edit
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  //Search
  const [search, setSearch] = useState("");

  //Filter
  const [filter, setFilter] = useState("all");

  // Loading
  const [loading, setLoading] = useState(true);

  //Login
  const handleLogin = (e) => {
    e.preventDefault();

    //email
    if (email === "admin@test.com" && password === "1234") {
      setIsLoggedIn(true);

      //save
      localStorage.setItem("isLoggedIn", "true");

      setLoginError("");
    } else {
      setLoginError("Invalid email or password");
    }
  };

  //Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  //load tasks
  useEffect(() => {
    fetch(" https://checklist-backend-texa.onrender.com/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  //Add Task
  const addTask = async () => {
    if (task.trim() === "") return;

    const res = await fetch(" https://checklist-backend-texa.onrender.com/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: task,
        completed: false,
      }),
    });

    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setTask("");
  };

  //Delete Task
  const deleteTask = async (id) => {
    await fetch(` https://checklist-backend-texa.onrender.com/tasks/${id}`, {
      method: "DELETE",
    });

    setTasks(tasks.filter((t) => t._id !== id));
  };

  //Toggle Task
  const toggleTask = async (taskObj) => {
    const res = await fetch(` https://checklist-backend-texa.onrender.com/tasks/${taskObj._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...taskObj,
        completed: !taskObj.completed,
      }),
    });

    const updated = await res.json();

    setTasks(tasks.map((t) => (t._id === taskObj._id ? updated : t)));
  };

  //Edit Task
  const saveEdit = async (id) => {
    if (editText.trim() === "") return;

    const res = await fetch(` https://checklist-backend-texa.onrender.com/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editText,
      }),
    });

    const updated = await res.json();

    setTasks(tasks.map((t) => (t._id === id ? updated : t)));

    setEditId(null);
    setEditText("");
  };

  //Filter
  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  //Search
  const finalTasks = filteredTasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  //login html
  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="loginContainer">
          <h1>Login</h1>

          <form
            className="loginForm"
            onSubmit={handleLogin}
            style={{
              flexDirection: "column",
            }}
          >
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
          </form>

          {loginError && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {loginError}
            </p>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "15px",
              opacity: 0.7,
              fontSize: "14px",
            }}
          >
            Demo Login:
            <br />
            admin@test.com / 1234
          </p>
        </div>
      </div>
    );
  }

  //checklist html
  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>CheckList...</h1>

            <p className="subtitle">Stay organized and productive ✨</p>
          </div>

          <button className="logoutBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Add Task */}
        <form
          className="inputBox"
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
        >
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a task..."
          />
          <button type="submit">+</button>
        </form>

        {/* Counter */}
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          {tasks.filter((t) => !t.completed).length} tasks left
        </p>

        {/* Search */}
        <input
          className="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>

          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        {/* Tasks */}
        <div className="section">
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading...</p>
          ) : finalTasks.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.6 }}>
              No tasks found 👀
            </p>
          ) : (
            finalTasks.map((t) => (
              <div className={`task ${t.completed ? "done" : ""}`} key={t._id}>
                {editId === t._id ? (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEdit(t._id);
                        }
                      }}
                      style={{ flex: 1 }}
                    />

                    <button onClick={() => saveEdit(t._id)}>Save</button>
                  </div>
                ) : (
                  <>
                    <span onClick={() => toggleTask(t)}>{t.title}</span>

                    <div>
                      <button
                        onClick={() => {
                          setEditId(t._id);
                          setEditText(t.title);
                        }}
                      >
                        ✏️
                      </button>

                      <button onClick={() => deleteTask(t._id)}>❌</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
