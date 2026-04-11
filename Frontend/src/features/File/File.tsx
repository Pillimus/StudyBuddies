import React from "react";
import Navbar from "../../components/layout/navigationbar"; 
import "./file.css"; 

const Files = () => {
  return (
    <div className="files-container">
      <Navbar />

      <div className="files-content">
        <h1>Files</h1>

        <button className="upload-btn">+ Upload File</button>

        <div className="file-list">
          <div className="file-card">📄 Notes 1</div>
          <div className="file-card">📄 Homework</div>
          <div className="file-card">📄 Study Guide</div>
        </div>
      </div>
    </div>
  );
};

export default Files;