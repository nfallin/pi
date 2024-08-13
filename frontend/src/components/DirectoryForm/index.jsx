import React, { useEffect, useState } from 'react'
import './style.css'

export default function DirectoryForm({files, navigateDown, navigateUp, advanced}) {
    const[entry, setEntry] = useState("");

    // for form autocomplete
    const[matches, setMatches] = useState({});
    const[matchIndex, setMatchIndex] = useState(0);

    // instantiates the list of autocomplete matches
    useEffect(() => {
        setMatches(files);
    }, [files]);

    // when the entry changes or then the advanced mode check is clicked, re-calculate the list of potential auto-complete matches
    useEffect(() => {
        if (!(files.find(f=> f.name === entry))) {
            const advancedModeMatches = files.filter(f => advanced || !isAdvancedFile(f));
            const newMatches = advancedModeMatches.filter(f => typeof f.name == "string" && (f.name.toLowerCase()).startsWith(entry.toLowerCase()));

            // if no matches, then autocomplete to all files
            if (newMatches.length == 0) {
                setMatches(advancedModeMatches);
            }
            else {
                setMatches(newMatches);
            }
            setMatchIndex(0);
        }
    }, [entry, advanced, files])

    function handleEntryChange(e) {
        const entry = e.target.value;
        setEntry(entry);
    }

    function handleAutoComplete() {
        setMatchIndex((matchIndex + 1) % matches.length);
        const newMatch = matches[matchIndex];
        setEntry(newMatch.name);
    }

    function isAdvancedFile(file) {
        const name = file.name;
        return name.startsWith('.') || name == 'desktop.ini' || name == 'thumbs.db'
    }
    
    function handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleAutoComplete();
        }
        else if (e.key === 'Enter') {
            if (entry == '..') {
                navigateUp();
            }
            else {
                const matchedFile = files.find(f => f.name === entry);
                if (matchedFile) {
                    navigateDown(matchedFile);
                }
            }
            setEntry("");
        }
    }

    return (
        <div className='form-contents-container'>
            <input className='directory-form'
                type="text"
                value={entry}
                onChange={handleEntryChange}
                onKeyDown={handleKeyDown}
                placeholder="cd..."
                autoComplete="off"
            />

            <button onClick={handleAutoComplete}>fill</button>
        </div>
    )
}