import React from 'react'
import './index.css'

function FileNode({file, currentDirectory, onNavigateDown}) {
    const icon = file.is_dir ? '📁' : '📄';

    const handleClick = () => {
        if (file.is_dir) {
            onNavigateDown(`${currentDirectory}/${file.name}`)
        } else {
            console.log(`requesting file data for ${file.name}`)
        }
        
    }

    const fetchFileData = () => {
        
    }

    return (
        <button 
            className="file-node-button font"
            onClick={handleClick}
        >
        {icon} {file.name}
        </button>
    );
};



export default FileNode