import React, {useState, useEffect } from 'react';
import FileNode from '../FileNode';
import DirectoryForm from '../DirectoryForm'
import './style.css'

export default function FileExplorer({setFileURL, setFileType}) {
    const[config, setConfig] = useState({});
    const[currentDirectory, setCurrentDirectory] = useState("");
    const[server, setServer] = useState("");
    const[files, setFiles] = useState([]);
    const[advanced, setAdvanced] = useState(false);

    // fetch config data on component mount
    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        const reponse = await fetch('/static/config.json');
        const configData = await reponse.json();
        setConfig(configData);
    }

    // assign home directory and backend address based on config
    // t_home/t_ip/t_port for windows, home/ip/port for pi
    useEffect(() => {
        setCurrentDirectory(config.home);
        setServer(`http://${config.ip}:${config.port}`)
    }, [config]);

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

    async function fetchFile(path) {
        try {
            const url = `${server}/stream`
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
            const blob = await response.blob();

            if (blob) {
                const fileURL = URL.createObjectURL(blob);
                const fileType = response.headers.get("Content-Type") || "application/octet-stream";

                setFileURL(fileURL);
                setFileType(fileType);
            }

        } catch(error) {
            console.error('Error fetching file in FileExplorer:', error);
        }
    }

    // move down to the specified directory   
    function navigateDown(file) {
        if (file.is_dir) {
            setCurrentDirectory(`${currentDirectory}/${file.name}`);
        } else {
            // look into firing custom events that the file detail component listens for 
            console.log(`requesting file data for ${file.name}`)
            
            // fetch file data and print it to console.log
            fetchFile(`${currentDirectory}/${file.name}`)

        }
    }

    // returns true if the current directory is the home directory
    // helper function for navigateUp
    function atHome() {
        return currentDirectory == config.home
    }

    // move up to the previous directory
    // function disabled when at the home directory to prevent unwanted file access
    function navigateUp() {
        if (!atHome()) {
            const isUnix = currentDirectory.charAt(0) == "/"

            const segments = currentDirectory.split('/').filter(Boolean);
            if (segments.length > 0) {
              segments.pop(); 
            }
    
            const newDirectory = segments.join('/');
            if (isUnix) {
                setCurrentDirectory('/' + newDirectory);
            } else {
                setCurrentDirectory(newDirectory);
            }
        }
    }

    // toggle advanced files
    function toggleAdvanced() {
        setAdvanced(!advanced);
    }

    function isAdvancedFile(file) {
        const name = file.name;
        return name.startsWith('.') || name == 'desktop.ini' || name == 'thumbs.db'
    }

    return (
        <div className='file-explorer-container'>
            {/* navigation options */}
            <div className='nav-tools-container'>
                <button className={"back-button " + (atHome() ? "back-button-disabled" : "")} onClick={navigateUp}>
                    back
                </button>

                <label className='advanced-mode'>
                    <input
                        type="checkbox" checked={advanced} onChange={toggleAdvanced}/>
                    advanced
                </label>
            </div>

            {/* current directory display */}
            <div className='current-directory-container'>
                <h2 className='current-directory'>
                    {(currentDirectory || "").split('/').join('/\u200B')}
                </h2>
            </div>


            {/* list of files in the current directory */}
            <div className='file-list-container'>
                <div className='file-list'>
                    {files.map(file => {
                        if (!advanced && isAdvancedFile(file)) {
                            return null
                        } else {
                            return (
                                <FileNode
                                    key={file.name}
                                    file={file}
                                    navigateDown={navigateDown}
                                />
                            )
                        }
                    })}
                </div>
            </div>

            {/* Directory search bar */}
            <div className='directory-form-container'>
                <DirectoryForm files={files} navigateDown={navigateDown} navigateUp={navigateUp} advanced={advanced}/>
            </div>
        </div>
    )
}