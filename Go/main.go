package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"regexp"

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

const md5_token = "582846f37273cf8f4b0cc17d67c34c47"
const uploadFileSavePath = "./upload"

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/backdoor/api", BackDoorApi)
	mux.HandleFunc("/backdoor/form", BackDoorForm)
	server := &http.Server{
		Addr:    ":8083",
		Handler: mux,
	}
	err := server.ListenAndServe()
	if err != nil {
		fmt.Println(err)
	}
}

//handle api-style request
func BackDoorApi(w http.ResponseWriter, r *http.Request) {
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
	//switch in different function according to the api
	switch postdata.Api {
	case "UpdataPlugIn":
		logs.Info("TODO...")
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
	if r.Method != "POST" {
		logs.Error("Unsuppose method:%s", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var api, token string
	response := ReplyRroto{}
	if err := r.ParseMultipartForm(20 << 20); err != nil {
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
	case "pluginupdate": //upadate plug in by upload os file
		pid := getMultipartFormValue(r.MultipartForm, "pid")
		tag := getMultipartFormValue(r.MultipartForm, "tag")
		logs.Info(pid, tag)
		if files, _ := r.MultipartForm.File["osfile"]; len(files) == 0 {
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
			reg, _ := regexp.Compile(`^[^\.]+\.os$`)
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

//============================ tool function =========================

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
