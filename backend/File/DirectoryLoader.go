package File

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type FileInfo struct {
	Name     string     `json:"name"`
	IsDir    bool       `json:"is_dir"`
	Children []FileInfo `json:"children,omitempty"`
}

func GetDirectoryStructure(directory string) ([]byte, error) {
	root := scanDirectory(directory)

	jsonData, err := json.MarshalIndent(root, "", " ")
	if err != nil {
		return nil, err
	}

	return jsonData, err
}

func scanDirectory(path string) FileInfo {
	info, err := os.Stat(path)
	if err != nil {
		return FileInfo{}
	}

	fileInfo := FileInfo{
		Name:  filepath.Base(path),
		IsDir: info.IsDir(),
	}

	if info.IsDir() {
		files, _ := os.ReadDir(path)
		for _, file := range files {
			// goes one layer deep
			fileInfo.Children = append(fileInfo.Children, FileInfo{Name: file.Name(), IsDir: file.IsDir()})

			// goes recursively until no more directories are found
			// fileInfo.Children = append(fileInfo.Children, scanDirectory(filepath.Join(path, file.Name())))
		}
	}

	return fileInfo
}
