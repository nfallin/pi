package Web

import (
	"encoding/json"
	"log"
	"os"
)

type ConfigData struct {
	IP string `json:"ip"`
	Port string `json:"port"`
	Home string `json:"home"`
}

var info ConfigData

func ReadConfig() {
	bytes, err := os.ReadFile("../frontend/dist/config.json")
	if (err != nil) {
		log.Fatal(err)
	}


	err = json.Unmarshal(bytes, &info)
	if (err != nil) {
		log.Fatal(err)
	}
	info.Home = cleanDirectory(info.Home)
}

func getConfig() ConfigData {
	ReadConfig() // allows for hot switching of config variables
	return info
}
