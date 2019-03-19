<template>
  <div>
    <div class="flex-img" id="img-arr">
      <div class="upload-img" v-for="(imgstr,index) in imgStrArr" :key="index">
        <i class="smui-icon smui-icon-cancel" @click="deleImg(index)"></i>
        <img style="width:65px;height:65px" :src="imgstr">
      </div>
      <div class="upload-add-img" style="position:relative;">
        <i class="smui-icon smui-icon-camera">
          <div class="img-input">
            <input
              type="file"
              id="img-upload-file"
              name="myfile"
              @change="UpladFile(url,quality)"
              class="img-file"
              accept="image/x-png, image/jpg, image/jpeg, image/gif"
            >
          </div>
        </i>
      </div>
    </div>
  </div>
</template>
<script>
import qs from 'qs'
export default {
  // url上传地址  quality 质量比例 默认 0.7  0-1
  name: "imgUpload",
  data() {
    return {
      url: "xxxxx",
      quality: "0.3",
      xhr: {},
      ot: 0,
      oloaded: 0,
      imgStrArr: [],
      reportRecordId: "",
      httpConfig: {
        headers: {
          'Content-Type': 'multipart/form-data;charset=gbk',
          'Accept': '*/*'
        }
      },
    };
  },
  methods: {
    deleImg(i) {
      this.imgStrArr.pop(i);
    },
    /*
			三个参数
			file：一个是文件(类型是图片格式)，
			w：一个是文件压缩的后宽度，宽度越小，字节越小
			objDiv：一个是容器或者回调函数
			photoCompress()
			*/
    photoCompress(file, w, objDiv) {
      var _this = this;
      var ready = new FileReader();
      /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
      ready.readAsDataURL(file);
      ready.onload = function() {
        var re = this.result;
        _this.canvasDataURL(re, w, objDiv);
      };
    },
    //重新绘制图片
    canvasDataURL(path, obj, callback) {
      var img = new Image();
      img.src = path;
      img.onload = function() {
        var that = this;
        // 默认按比例压缩
        var w = that.width,
          h = that.height,
          scale = w / h;
        w = obj.width || w;
        h = obj.height || w / scale;
        var quality = 0.7; // 默认图片质量为0.7
        //生成canvas
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        // 创建属性节点
        var anw = document.createAttribute("width");
        anw.nodeValue = w;
        var anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
          quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL("image/jpeg", quality);
        // 回调函数返回base64的值
        callback(base64);
      };
    },
    /**
     * 将以base64的图片url数据转换为file
     * @param dataurl
     *  用url方式表示的base64图片数据
     */
    dataURLtoFile(dataurl, filename) {//将base64转换为文件
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    },
    //上传文件方法
    UpladFile(url, quality) {
      if (this.imgStrArr.length > 2) {
        return;
      }
      var fileObj = document.getElementById("img-upload-file").files[0]; // js 获取文件对象
      var form = new FormData(); // FormData 对象
      var _this = this;
      if (fileObj.size / 1024 > 20) {
        //大于1M，进行压缩上传
        // this.$loading.show({
        //   text: 0 + "%"
        // });
        this.photoCompress(
          fileObj,
          {
            quality: quality
          },
          function(base64Codes) {
            //console.log("压缩后：" + base.length / 1024 + " " + base);
            _this.imgStrArr.push(base64Codes);
            form.append("file", _this.imgStrArr, "file_" + Date.parse(new Date()) + ".jpg"); // 文件对象
            let imgFile = _this.dataURLtoFile(base64Codes,fileObj.name)
            _this.ajaxUpload(imgFile)
          }
        );
      } else {
        //小于等于1M 原图上传
        var reader = new FileReader();
        reader.readAsDataURL(fileObj);
        reader.onload = function() {
          _this.imgStrArr.push(this.result); //this.result是base64编码
        };
        form.append("file", fileObj); // 文件对象
         _this.ajaxUpload(fileObj)
      }
    },
    // 上传调接口
    ajaxUpload(_file) {
      let self = this;
      let fd = new FormData(); // FormData 对象
      fd.append("files", _file, _file.name); // 文件对象
      self.$http.post(self.url, fd, self.httpConfig).then((res) => {
        if (res.data.status == 0) {

        } else {
          alert('图片上传失败，请检查网络后重新上传！');
          return false;
        }
      });
    },

    //上传成功响应
    uploadComplete(evt) {
      //服务断接收完文件返回的结果
      //console.log('回复',evt.target.responseText);
      var data = JSON.parse(evt.target.responseText);
      //console.log('回复',data);
      if (data.reportRecordId) {
        this.reportRecordId = data.reportRecordId;
        //传递数据给父组件
        this.$emit("uplodCallBack", data.reportRecordId);
        this.$toast.show({
          type: "text",
          text: "文件上传成功",
          time: 1000
        });
      } else {
        this.$toast.show({
          type: "text",
          text: "文件上传失败",
          time: 1000
        });
        this.imgStrArr.pop();
      }
    },
    //上传失败
    uploadFailed(evt) {
      this.$toast.show({
        type: "text",
        text: "文件上传失败",
        time: 1000
      });
      this.imgStrArr.pop();
    },
    //取消上传
    cancleUploadFile() {
      this.xhr.abort();
    },
    //上传进度实现方法，上传过程中会频繁调用该方法
    progressFunction(progressEvent) {
      if (progressEvent.lengthComputable) {
        var num = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        console.log("num=" + num);
        if (num < 100) {
          this.$loading.show({
            text: num + "%"
          });
        } else {
          this.$loading.hide();
        }
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.img-upload .flex-img {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
.img-upload .upload-img {
  margin-left: 10px;
  margin-top: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 72px;
  height: 72px;
  text-align: center;
  font-size: 32px;
  position: relative;
  line-height: 74px;
}
.img-upload .smui-icon-cancel {
  position: absolute;
  top: -10px;
  left: 60px;
  font-size: 16px;
  color: #ccc;
}
.img-upload img {
  margin: 3px;
}

.img-upload .upload-add-img {
  margin: 5px 15px 5px 10px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 3px;
  width: 80px;
  height: 80px;
  text-align: center;
  font-size: 32px;
  color: #ccc;
  line-height: 62px;
}
.img-upload .img-input {
  width: 70px;
  height: 70px;
  position: absolute;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  //background: #03c
}
.img-upload.img-file {
  width: 70px;
  height: 70px;
  opacity: 0; /*设置此控件透明度为零，即完全透明*/
  filter: alpha(opacity=0); /*设置此控件透明度为零，即完全透明针对IE*/
  //font-size:100px;
  position: absolute; /*绝对定位，相对于 .input */
  top: 0;
  right: 0;
}
</style>


