import "./App.css"
import React, {useState} from 'react';
import FileExplorer from "./components/FileExplorer"
import FileViewer from "./components/FileViewer"

function App() {

  const [fileURL, setFileURL] = useState("");
  const [fileType, setFileType] = useState(""); 

  return (
    <div className="font">
      <div className="main-container">
        <FileExplorer setFileURL={setFileURL} setFileType={setFileType}></FileExplorer>
        <FileViewer fileURL={fileURL} fileType={fileType}></FileViewer>
      </div>
    </div>
  )
}

export default App
