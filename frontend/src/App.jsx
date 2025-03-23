import "./App.css"
import React, {useState} from 'react';
import FileExplorer from "./components/FileExplorer"
import FileViewer from "./components/FileViewer"

function App() {

  const [fileURL, setFileURL] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const[currentDirectory, setCurrentDirectory] = useState("");
  const[server, setServer] = useState("");
  const[files, setFiles] = useState([]);

  // obtain a list of files in a given directory on the machine the server is running on
  async function fetchChildren(path) {
    try {
        const url = `${server}/files`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ directory: path })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dirContents = await response.json();
        if (dirContents.children) {
          setFiles(dirContents.children);
        } else {
          setFiles([]);
        }
    } catch(error) {
        console.error('Error fetching directory in FileExplorer:', error);
    }
}

  return (
    <div className="font">
      <div className="main-container">
        <FileExplorer setFileURL={setFileURL} setFileType={setFileType} setFileName={setFileName} currentDirectory={currentDirectory} setCurrentDirectory={setCurrentDirectory} server={server} setServer={setServer} files={files} fetchChildren={fetchChildren}></FileExplorer>
        <FileViewer fileURL={fileURL} setFileURL={setFileURL} fileType={fileType} setFileType={setFileType} fileName={fileName} setFileName={setFileName} currentDirectory={currentDirectory} server={server} refreshList={fetchChildren}></FileViewer>
      </div>
    </div>
  )
}

export default App
