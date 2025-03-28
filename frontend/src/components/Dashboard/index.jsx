import "./style.css"
import React, {useState, useEffect} from 'react';
import FileExplorer from "../FileExplorer"
import FileViewer from "../FileViewer"

export default function Dashboard({server, currentDirectory, setCurrentDirectory, config, setIsLoggedIn}) {
    
    const[fileURL, setFileURL] = useState("");
    const[fileType, setFileType] = useState("");
    const[fileName, setFileName] = useState("");
    const[files, setFiles] = useState([]);

    var parent;

    // define parent directory on component mount
    useEffect(() => {
        parent = currentDirectory;
    }, []);

    // fetch children whenever the directory changes
    useEffect(() => {
        if (currentDirectory && server) {
            fetchChildren(currentDirectory)
        }
    }, [currentDirectory, server]);
    
    // obtain a list of files in a given directory on the machine the server is running on
    async function fetchChildren(path) {
        try {
            const url = `${server}/files`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ directory: path }),
                credentials: "include"
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
    
    async function refresh() {
        fetchChildren(currentDirectory);
    }
    
    async function fetchFile(path, name) {
        try {
            const url = `${server}/stream`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ directory: path }),
                credentials: "include"
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            
            if (blob) {
                const fileURL = URL.createObjectURL(blob);
                const fileType = response.headers.get("Content-Type") || "application/octet-stream";
                
                // window.open(fileURL);
                
                setFileURL(fileURL);
                setFileType(fileType);
                setFileName(name);
            }
            
        } catch(error) {
            console.error('Error fetching file in FileExplorer:', error);
        }
    }
    
    async function closeFile() {
        setFileName("");
        setFileType("");
        setFileURL("");
    }
    
    return (
        <div className="font">
            <div className="main-container">
                <FileExplorer fetchFile={fetchFile} refresh={refresh} currentDirectory={currentDirectory} setCurrentDirectory={setCurrentDirectory} server={server} files={files} config={config}></FileExplorer>
                <FileViewer fileURL={fileURL} fileType={fileType} fileName={fileName} currentDirectory={currentDirectory} server={server} refreshList={fetchChildren} closeFile={closeFile} setIsLoggedIn={setIsLoggedIn}></FileViewer>
            </div>
        </div>
    )
}
