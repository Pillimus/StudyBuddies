import React, { useState } from "react";
import Navbar from "../../../components/layout/navigationbar";
import "./Dashboard.css";
import bgImage from "../../../assets/gradient.avif";
import grdImg from "../../../assets/images.jpg";

const Dashboard = () => {
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, newTask]);
    setNewTask("");
  };

  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="main-content">
        <div className="top-row">
          <div
            className="card bg-card small"
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            <h2>Hi UserName</h2>
            <p>• 3 Tasks left</p>
            <p>• 2 events left</p>
            <p>• 4 unread messages</p>
          </div>

        
          <div
            className="card bg-card large"
            style={{
              backgroundImage: `url(${bgImage})`,
              display: "flex",
              flexDirection: "column",
              height: "150px",      
              overflow: "hidden",    
            }}
          >
            <h2>Tasks</h2>

            {/* INPUT */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  outline: "none",
                }}
              />
              <button className="add-btn" onClick={addTask}>
                +
              </button>
            </div>

            {/*SCROLL AREA*/}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "5px",
              }}
            >
              {tasks.map((task, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <p>{task}</p>
                  <button
                    onClick={() => deleteTask(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {/*remove button - must replace with nicer button*/}
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="bottom-row">
          <div
            className="card large grdcard"
            style={{ backgroundImage: `url(${grdImg})` }}
          >
            <h2>Groups</h2>
            <div className="group-list">
              <span>COP 3402: Project 2</span>
              <span>M.L. FINAL review</span>
              <span>Calculus 3</span>
              <span>Chem study group</span>
              <span>Foundation exam prep</span>
            </div>
          </div>

          <div
            className="card small grdcard img-zoom"
            style={{ backgroundImage: `url(${grdImg})` }}
          >
            <p>Tasks Completed: 2</p>
            <p>Groups Joined: 3</p>
            <p>Files Uploaded: 10</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;