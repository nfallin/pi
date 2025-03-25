import React, {useState, useEffect } from 'react';
import FileNode from '../FileNode';
import DirectoryForm from '../DirectoryForm'
import './style.css'

export function refreshList() {}

export default function FileExplorer({refresh, currentDirectory, setCurrentDirectory, fetchFile, files, config}) {
    const[advanced, setAdvanced] = useState(false);
    const[collapsed, setCollapsed] = useState(false);

    // move down to the specified directory   
    function navigateDown(file) {

        // if no input is given, refresh the current directory
        if (!file) {
            fetchFiles(currentDirectory);
        }

        if (file.is_dir) {
            setCurrentDirectory(`${currentDirectory}/${file.name}`);
        } else {
            // look into firing custom events that the file detail component listens for 
            console.log(`requesting file data for ${file.name}`);
            
            // fetch file data and print it to console.log
            fetchFile(`${currentDirectory}/${file.name}`, file.name);

        }
    }

    // returns true if the current directory is the home directory
    // helper function for navigateUp
    function atHome() {
        return currentDirectory == config.home;
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

    function toggleCollapsed() {
        setCollapsed(!collapsed);
    }

    return (
        <div className='file-explorer-container' style={{marginLeft: collapsed ? "-238px" : "0px", transition: "margin-left 0.3s ease-in-out"}}>
            {/* navigation options */}
            <div className='nav-tools-container'>
                <button className={"back-button " + (atHome() ? "back-button-disabled" : "")} onClick={navigateUp}>
                    back
                </button>

                <button className="back-button" onClick={refresh}>Refresh</button>

                <label className='advanced-mode'>
                    <input
                        type="checkbox" checked={advanced} onChange={toggleAdvanced}/>
                    advanced
                </label>
                
                <button className ="collaspe-button, back-button" onClick={toggleCollapsed}>
                    {collapsed ? "expand" : "collapse"}
                </button>

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