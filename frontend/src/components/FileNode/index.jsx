import React from 'react'
import './style.css'

export default function FileNode({file, navigateDown}) {
    const icon = file.is_dir ? '📁' : '📄';

    function handleClick() {
        navigateDown(file);
    }

    return (
        <button className='file-node-button font' onClick={handleClick}>
            {icon} {file.name}
        </button>
    );
};