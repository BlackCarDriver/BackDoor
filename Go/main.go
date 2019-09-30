package main

import (
	"bufio"
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"

	"github.com/astaxie/beego/logs"
)

type RequestRroto struct {
	Api   string      `json:"api"`
	Token string      `json:"token"`
	Data  interface{} `json:"data"`
}
type ReplyRroto struct {
	Status int         `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
}
type Memstat struct {
	Total     int `json:"total"`
	Used      int `json:"used"`
	Free      int `json:"free"`
	Shared    int `json:"shared"`
	Cache     int `json:"cache"`
	Available int `json:"available"`
}
type Cpustat struct {
	OMin  float64 `json:"omin"`
	FMin  float64 `json:"fmin"`
	FtMin float64 `json:"ftmin"`
}

const md5_token = "fae0b27c451c728867a567e8c1bb4e53"
const backdoorhtmlPaht = "./backdoor.html"
const uploadFileSavePath = "./upload"
const LogsRootPath = "/home/ubuntu/DockerWorkPlace/Market/DriverClub-taobao/Go/src/TaobaoServer/logs"

func main() {
	logs.SetLogger("console")
	logs.EnableFuncCallDepth(true)
	logs.SetLogFuncCallDepth(3)

	mux := http.NewServeMux()
	mux.HandleFunc("/backdoor/api", BackDoorApi)
	mux.HandleFunc("/backdoor/form", BackDoorForm)
	mux.HandleFunc("/backdoor/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, backdoorhtmlPaht)
	})
	logs.Info("The progress is running at :8093")
	err := http.ListenAndServe("0.0.0.0:8093", mux)
	if err != nil {
		logs.Error(err)
	}
}

//handle api-style request
func BackDoorApi(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	if r.Method != "POST" {
		logs.Error("Unsuppose method:%s", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	postdata := RequestRroto{}
	response := ReplyRroto{}
	response.Status = 0
	body, _ := ioutil.ReadAll(r.Body)
	if err := json.Unmarshal(body, &postdata); err != nil {
		logs.Error(err)
		response.Status = -1
		response.Msg = fmt.Sprintf("%v", err)
		goto tail
	}
	if !CheckToken(postdata.Token) {
		response.Status = -2
		response.Msg = fmt.Sprintf("Token not accepted!")
		logs.Error(response.Msg)
		goto tail
	}
	//catch unexpect panic
	defer func() {
		if err, ok := recover().(error); ok {
			response.Status = -99
			response.Msg = fmt.Sprintf("Unexpect error happen, error: %v", err)
			logs.Error(response.Msg)
			if err := WriteJson(w, &response); err != nil {
				logs.Error(err)
			}
		}
	}()
	//switch in different function according to the api
	switch postdata.Api {
	case "linuxstat":
		var linuxstat struct {
			CpuState Cpustat `json:"cpuState"`
			MenState Memstat `json:"menState"`
			VmState  string  `json:"vmState"`
		}
		linuxstat.CpuState, _ = GetUptime()
		linuxstat.MenState, _ = GetFree()
		linuxstat.VmState, _ = GetVmstat()
		response.Data = linuxstat

	case "logslist":
		data, err := GetLogsList()
		if err != nil {
			response.Status = -3
			response.Msg = fmt.Sprint(err)
			goto tail
		}
		response.Data = data
	case "logsDetail":
		name := ""
		if postdata.Data != nil {
			name = postdata.Data.(string)
		}
		res := GetLogsDetail(name)
		response.Data = res

	case "clearlogs", "deletelogs":
		name := postdata.Data.(string)
		if name == "" {
			response.Status = -4
			response.Msg = "Can't get file name from request"
			goto tail
		}
		if postdata.Api == "clearlogs" {
			if err := ClearLogs(name); err != nil {
				response.Status = -5
				response.Msg = fmt.Sprintf("Clear logs fail: %v", err)
				goto tail
			}
			response.Msg = "Clear success!"
			goto tail
		} else if postdata.Api == "deletelogs" {
			if err := DelLogs(name); err != nil {
				response.Status = -6
				response.Msg = fmt.Sprintf("delete logs fail: %v", err)
				goto tail
			}
			response.Msg = "Delete success!"
			goto tail
		}
	case "static":
		response.Data = mokeStatic
	default:
		response.Status = -99
		response.Msg = fmt.Sprintf("Unsuppose api: %s", postdata.Api)
		logs.Error(response.Msg)
		goto tail
	}
	response.Msg = "Success!"
tail:
	if err := WriteJson(w, &response); err != nil {
		logs.Error(err)
	}
}

//handle form-style request
func BackDoorForm(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	if r.Method != "POST" {
		logs.Error("Unsuppose method:%s", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var api, token string
	response := ReplyRroto{}
	if err := r.ParseMultipartForm(40 << 20); err != nil {
		response.Status = -1
		response.Msg = fmt.Sprintf("%v", err)
		logs.Error(err)
		goto tail
	}
	//get and check api and token from the request
	api = getMultipartFormValue(r.MultipartForm, "api")
	token = getMultipartFormValue(r.MultipartForm, "token")
	if api == "" || token == "" {
		response.Status = -1
		response.Msg = fmt.Sprintf("Can't get api or token from request!")
		logs.Error(response.Msg)
		goto tail
	}
	if CheckToken(token) == false {
		response.Status = -2
		response.Msg = "Token rejected!"
		logs.Error(response.Msg)
		goto tail
	}
	//use different function according to the api
	switch api {
	case "pluginupdate": //upadate plug in by upload so file
		pid := getMultipartFormValue(r.MultipartForm, "pid")
		tag := getMultipartFormValue(r.MultipartForm, "tag")
		logs.Info(pid, tag)
		if files, _ := r.MultipartForm.File["sofile"]; len(files) == 0 {
			response.Status = -3
			response.Msg = fmt.Sprintf("Can't find file in the from")
			logs.Error(response.Msg)
			goto tail
		} else {
			file := files[0]
			size := file.Size
			name := file.Filename
			logs.Info(size, name)
			//check file size,
			if size > 100<<20 {
				response.Status = -4
				response.Msg = "The uploaded file is too big! (more than 100 mb)"
				logs.Error(response.Msg)
				goto tail
			}
			//check file name and type
			reg, _ := regexp.Compile(`^[^\.]+\.so$`)
			if !reg.MatchString(name) {
				response.Status = -5
				response.Msg = "The name or type of the upload-file is reject!"
				logs.Error(response.Msg)
				goto tail
			}
			//save upload-file to the specified path
			tmpfile, err := file.Open()
			if err != nil {
				response.Status = -6
				response.Msg = fmt.Sprintf("Open file fail: %v", err)
				logs.Error(response.Msg)
				goto tail
			}
			defer tmpfile.Close()
			cur, err := os.Create(fmt.Sprintf("%s/%s", uploadFileSavePath, name))
			if err != nil {
				response.Status = -7
				response.Msg = fmt.Sprintf("Create file fail! :%v", err)
				logs.Error(response.Msg)
				goto tail
			}
			_, err = io.Copy(cur, tmpfile)
			if err != nil {
				response.Status = -7
				response.Msg = fmt.Sprintf("Save upload file fail: %v", err)
				logs.Error(response.Msg)
				goto tail
			}
			cur.Close()
		}

	default:
		response.Status = -99
		response.Msg = fmt.Sprintf("Unsuppose api: '%s'", api)
		logs.Error(response.Msg)
		goto tail
	}
	response.Status = 0
	response.Msg = "Success!"
tail:
	if err := WriteJson(w, &response); err != nil {
		logs.Error(err)
	}
}

//============================ logger tool function =====================
//get logs file list in the logs saving directory
func GetLogsList() ([]string, error) {
	file, err := os.Open(LogsRootPath)
	if err != nil {
		logs.Error(err)
		return nil, err
	}
	defer file.Close()
	fi, err := file.Readdir(0)
	if err != nil {
		logs.Error(err)
		return nil, err
	}
	logsList := make([]string, 0)
	for _, info := range fi {
		logsList = append(logsList, info.Name())
	}
	return logsList, nil
}

//get the text of a file
func GetLogsDetail(name string) string {
	if name == "" {
		return ""
	}
	logsPath := fmt.Sprintf("%s/%s", LogsRootPath, name)
	if content, err := ParseFile(logsPath); err != nil {
		logs.Error(err)
		return ""
	} else {
		return strings.ReplaceAll(content, "[E]", "🍎")
	}
}

//clear the content of a log file
func ClearLogs(name string) error {
	logsPath := fmt.Sprintf("%s/%s", LogsRootPath, name)
	file, err := os.OpenFile(logsPath, os.O_WRONLY|os.O_TRUNC, 0600)
	if err != nil {
		logs.Error(err)
		return err
	}
	defer file.Close()
	if _, err = file.WriteString(""); err != nil {
		logs.Error(err)
		return err
	}
	return nil
}

//delete a logs file in the logs saving directory
func DelLogs(name string) error {
	logsPath := fmt.Sprintf("%s/%s", LogsRootPath, name)
	return os.Remove(logsPath)
}

//============================ tool function =========================

func setHeader(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type,Authorization")
	w.Header().Set("content-type", "application/json")
}

//check whether the password is right
func CheckToken(token string) bool {
	h := md5.New()
	h.Write([]byte(token)) //Write of hash never return error
	if hex.EncodeToString(h.Sum(nil)) == md5_token {
		return true
	} else {
		return false
	}
}

//Write json format data to a request
func WriteJson(w http.ResponseWriter, data interface{}) error {
	if bytes, err := json.Marshal(data); err != nil {
		logs.Error(err)
		return err
	} else if _, err = w.Write(bytes); err != nil {
		logs.Error(err)
		return err
	}
	return nil
}

//get first value in mutipaart form according to key
func getMultipartFormValue(f *multipart.Form, key string) string {
	arrays := f.Value[key]
	if len(arrays) == 0 {
		return ""
	}
	return arrays[0]
}

//read a file and parse it into a string 📂
func ParseFile(path string) (text string, err error) {
	file, err := os.Open(path)
	if err != nil {
		logs.Error(err)
		return "", fmt.Errorf("Open %s fall: %v", path, err)
	}
	defer file.Close()
	buf := bufio.NewReader(file)
	bytes, err := ioutil.ReadAll(buf)
	if err != nil {
		logs.Error(err)
		return "", fmt.Errorf("ioutil.ReadAll fall : %v", err)
	}
	return string(bytes), nil
}

//============================linux stat tool function ====================

//exec vmstat command to get the report of virtual memory statistics
func GetVmstat() (string, error) {
	res := ""
	var err error
	if res, err = linuxExec("vmstat"); err != nil {
		logs.Error(err)
	} else {
		res = strings.Replace(res, "\n", "</br>", -1)
	}
	return res, err
}

//exec free command to get the message of memory using
func GetFree() (Memstat, error) {
	data := Memstat{}
	var err error
	if res, err := linuxExec("free", "-m"); err != nil {
		logs.Error(err)
	} else {
		sid := strings.Index(res, "Mem:")
		eid := strings.Index(res, "Swap:")
		res := res[sid+4 : eid]
		fmt.Sscanf(res, "%d %d %d %d %d %d", &data.Total, &data.Used, &data.Free, &data.Shared, &data.Cache, &data.Available)
	}
	return data, err
}

//exec uptime command to get the message of System load averages
func GetUptime() (Cpustat, error) {
	data := Cpustat{}
	var err error
	if res, err := linuxExec("uptime"); err != nil {
		logs.Error(err)
	} else {
		index := strings.LastIndex(res, ":")
		fmt.Sscanf(res[index+1:], "%f, %f, %f", &data.OMin, &data.FMin, &data.FtMin)
	}
	return data, err
}

//exec a linux command and return the output string
func linuxExec(name string, arg ...string) (string, error) {
	var out, stderr bytes.Buffer
	cmd := exec.Command(name, arg...)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	var err error
	if err = cmd.Start(); err != nil {
		return "", err
	} else if err = cmd.Wait(); err != nil {
		return "", err
	}
	return out.String(), nil
}

//================= generate statice demo ==============
type Static struct {
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}

var mokeStatic = []Static{
	{"Total", 1000},
	{"Lasttime", "2019-22-12"},
	{"VisitTime", 123},
	{"VisitTime", 123},
	{"VisitTime", 123},
}
