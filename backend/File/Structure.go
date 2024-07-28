package File

import "fmt"

func depricated() {
	fmt.Println(":(")
}

// import (
// 	"encoding/json"
// 	"fmt"
// 	"os"
// 	"path/filepath"
// )

// type FileInfo struct {
// 	Name     string     `json:"name"`
// 	IsDir    bool       `json:"is_dir"`
// 	Children []FileInfo `json:"children,omitempty"`
// }

// func GetDirectoryStructure(directory string) ([]byte, error) {
// 	root := scanDirectory(directory)
// 	jsonData, err := json.MarshalIndent(root, "", " ")
// 	if err != nil {
// 		fmt.Println("Error: ", err)
// 		return nil, err
// 	}

// 	return jsonData, err
// }

// func scanDirectory(path string) FileInfo {
// 	info, err := os.Stat(path)
// 	if err != nil {
// 		fmt.Println("Error: ", err)
// 		return FileInfo{}
// 	}

// 	fileInfo := FileInfo{
// 		Name:  filepath.Base(path),
// 		IsDir: info.IsDir(),
// 	}

// 	if info.IsDir() {
// 		files, _ := os.ReadDir(path)
// 		for _, file := range files {
// 			fileInfo.Children = append(fileInfo.Children, scanDirectory(filepath.Join(path, file.Name())))
// 		}
// 	}

// 	return fileInfo
// }
