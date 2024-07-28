import React, { useState, useEffect } from 'react';
import FileNode from '../FileNode'
import './index.css'

function FileBrowser() {
  // const homeDirectory = 'C:/Users/sidek'; // for local testing
  const homeDirectory = '/home/nolan'; // for prod
  // const ip = 'localhost:8080'; // for local testing
  const ip = '192.168.1.232:8080'; // for prod

	const [config, setConfig] = useState(null);

  const [currentDirectory, setCurrentDirectory] = useState(homeDirectory);
  const [files, setFiles] = useState([]);
  const [displayAdvanced, setDisplayAdvanced] = useState(false);

	useEffect(() => {
		fetchConfig()
	}, []);

  useEffect(() => {
		if (config && currentDirectory) {
			fetchDirectory(currentDirectory);
		}
	}, [config, currentDirectory]);

	const fetchConfig = async () => {
		fetch('config.json')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => setConfig(data))
	}

  const fetchDirectory = async (path) => {
    try {
      const url = `http://${config.ip}:${config.port}/files`;
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

      const data = await response.json();
      if (data.children) {
        setFiles(data.children);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching directory:', error);
    }
  };

  const handleNavigateDown = (path) => {
    setCurrentDirectory(path)
  }

  const handleNavigateUp = () => {
    const segments = currentDirectory.split('/').filter(Boolean);
    if (segments.length > 0) {
      segments.pop();
      setCurrentDirectory('/' + segments.join('/'));
    } else {
      setCurrentDirectory('/');
    }
  };

  const handleDisplayAdvanced = () => {
    setDisplayAdvanced(!displayAdvanced)
  }

  return (
    <div>
      <div className='nav-tools'>
        <button 
          onClick={handleNavigateUp}
          disabled={currentDirectory === homeDirectory}
        >
          back
        </button>

        <label>
          <input
            type="checkbox"
            checked={displayAdvanced}
            onChange={handleDisplayAdvanced}
          />
          Display advanced
        </label>
      </div>

      <h1 className='font'>Current Directory: {currentDirectory}</h1>
      <div className='file-list'>
        {files.map(file => {
          if (!displayAdvanced && file.name.startsWith('.')) {
            return null
          } else {
            return (
              <FileNode 
                key={file.name} 
                file={file} 
                currentDirectory={currentDirectory} 
                onNavigateDown={handleNavigateDown}
              />
            ) 
          }
        })}
      </div>
    </div>
  );
}

export default FileBrowser;