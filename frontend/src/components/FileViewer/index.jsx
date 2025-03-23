import React, {useState, useEffect } from 'react';
import './style.css'
import { refreshList } from '../FileExplorer';


export default function FileViewer({fileURL, setFileURL, fileType, setFileType, fileName, setFileName, currentDirectory, server, refreshList}) {

    async function open() {
        if (fileURL) {
            console.log("opening: ", fileURL);
            window.open(fileURL);
        }
    }

    async function download() {
        if (fileURL) {
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = (fileName) ? fileName : "downloaded_file";
            link.click();
        }
    }

    async function close() {
        setFileName("");
        setFileType("");
        setFileURL("");
    }

    async function upload() {
        document.getElementById("fileInput").click();
        console.log("current directory: ", currentDirectory);
    }

    async function handleFileChange(event) {
        const uploadedFile = event.target.files?.[0];
        if (!uploadedFile) {
            return;
        }

        const formData = new FormData;
        formData.append("file", uploadedFile);
        formData.append("directory", currentDirectory);

        console.log("File in FormData:", formData.get("file")); 
        console.log("Directory in FormData:", formData.get("directory"));

        try {
            const url = `${server}/upload`
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contents = await response.json();
            console.log("file uploaded successfully: ", contents);
            refreshList(currentDirectory);
            

        } catch(error) {
            console.error('Error uploading file in FileViewer:', error);
        }

    }

    return (
        <div className='file-viewer-container'>

            {/* selected file options menu */}
            <div className='current-file-container'>

                <div className='file-menu-bar'>
                    <button className={"button " + ((!fileURL) ? "button-disabled" : "")} onClick={open}>open in new tab</button>
                    <button className={"button " + ((!fileURL) ? "button-disabled" : "")} onClick={download}>download selected file</button>
                    <button className={"button " + ((!fileURL) ? "button-disabled" : "")} onClick={close}>close selected file</button>
                    <button className={"button "} onClick={upload}>upload to current directory</button>
                    <input id="fileInput" type="file" style={{ display: "none" }} onChange={handleFileChange} />
                </div>

                <div className='current-file-background'>
                    <h2 className='current-file-name'>
                        {(fileName) ? fileName : "Select a file to view it"}
                    </h2>
                </div>
            </div>


            {/* different display methods depending on the file type */}
            {fileType.startsWith("image") && (
                <img src={fileURL} alt="Preview" style={{ maxWidth: "100%", maxHeight: "80%", objectFit: "contain", display: "block", margin: "auto"}} />
            )}

            {fileType.startsWith("video") && (
                <video key={fileURL} controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
                    <source src={fileURL} type={fileType} />
                    Your browser does not support video playback.
                </video>
            )}

            {fileType.startsWith("audio") && (
                <audio key={fileURL} controls style={{width: "100%"}}>
                    <source src={fileURL} type={fileType}/>
                    Your browser does not support audio playback.
                </audio>
            )}

            {fileType === "application/pdf" && (
                <iframe src={fileURL} width="100%" height="100%"></iframe>
            )}

            {(fileType.startsWith("text") || fileType === "application/json") && (
                (<iframe src={fileURL} style={{ width: "100%", height: "100%", border: "none" }}/>)
            )}
        </div>
    )
}