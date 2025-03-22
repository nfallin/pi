import React, {useState, useEffect } from 'react';
import './style.css'

export default function FileViewer({fileURL, fileType}) {

    if (fileType && fileURL) {
        if (fileType.startsWith("image")) {
            return <img src={fileURL} alt="Preview" style={{ maxWidth: "100%" }} />;
        }
        
        if (fileType.startsWith("video")) {
            return <video controls style={{ maxWidth: "100%" }}>
                <source src={fileURL} type={fileType} />
                Your browser does not support the video tag.
            </video>;
        }
    
        if (fileType === "application/pdf") {
            return <iframe src={fileURL} width="100%" height="500px"></iframe>;
        }
    
        if (fileType.startsWith("text") || fileType === "application/json") {
            return (
                <iframe src={fileURL} style={{ width: "100%", height: "500px", border: "none" }} />
            );
        }

        return <p>Unsupported file type: {fileType}</p>;
    }

    return <p>Select a file!</p>;


}