const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const inputArea = document.getElementById('msger-inputarea');
const sendButton = document.getElementById("msger-send-btn");

// Icons made by Freepik from www.flaticon.com
//const TYPEING_IMG    = "../../Resource/CustomerService/typing.gif";
const BOT_IMG = "../../Resource/CustomerService/DCT_Robot.ico";
const PERSON_IMG = "../../Resource/CustomerService/user.png";
const BOT_NAME = "DCT-BOT";
const PERSON_NAME = "User";

const isProduction = true; // 設置為true表示正式區，false表示測試區

var DCT_TeamMember = ["B5047", "D4677", "D6347", "F9084", "K15668"];

var ASE_ID = "";
var LogInErrorCnt = 0;

ASE_ID = sessionStorage.getItem('ASE_Account');
console.log("ID: " + ASE_ID);

//cp_seek_cookie();
// alert(ASE_ID);
// LogIN_ASE_ID();

//[主流程] 輸入關鍵字 按下Enter
sendButton.onclick = function () {
  const msgText = msgerInput.value.trim(); //去掉字串前後的空白字元
  if (!msgText) {
    return;
  }

  // 紀錄使用者發問內容
  getUserQuestion(ASE_ID,msgText);

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, formatDate(new Date()));
  msgerInput.value = "";

  botResponse(msgText);
}

// 偵測Enter按鈕
inputArea.addEventListener('submit', function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    sendButton.click();
  }
})

// 增加互動對話框
function appendMessage(name, img, side, text, timestamp) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${timestamp}</div>
        </div>
        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollBy(0, 500);
}

// 新增問題
function addNewQuestion(name, img, side) {
  const msgBubble = `
    <div class="msg-bubble">
      <div class="msg-info">
        <div class="msg-info-name">${name}</div>
        <div class="msg-info-time">${formatDate(new Date())}</div>
      </div>
      <div class="msg-text">
        抱歉, 我不了解您的問題, 請輸入其他關鍵字詢問, 或是點選按鈕進行提問, 相關人員會盡快回覆給您<br>
        <button type="button" class="msg-AddQuestion" data-toggle="modal" data-target="#exampleModal" data-whatever="mdo" onclick="selectFiles();">我要提問</button>
      </div>
    </div>
  `;

  const msgHTML = `
    <div id="BOT_Response" class="msg ${side}-msg">
      <div class="msg-img msg-img-${side}" style="background-image: url(${img})"></div>
      ${msgBubble}
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

// 新增關鍵字搜尋,點選後即顯示答案
function botResponse(msgKeyword) {

  var side = "left";
  var name = BOT_NAME;
  var img = BOT_IMG;
  var text = "";
  var msgHTML = "";

  const URI = isProduction ? 'https://coknow.kh.asegroup.com/qa_api' : 'http://10.11.66.118/qa_api';
  const SEARCH_POSTS_Token = isProduction ? 'GmcrBhhqA8JnPiex6IfgxiD9c0WW28Sl39MBMk0j644' : 'CxbzuXZQ9gD2WkynYzUeRxURpKNuZWhseOY3Q7lSAtM';
  var SEARCH_POSTS_API = '/get_search_posts?';

  var params = {
    token: SEARCH_POSTS_Token,
    content: msgKeyword,
    page: 1,
    sorted: "_score",
    size: 10,
    desc: 1,
    filter: "full_text",
    status: ""
  };

  $(function () {
    $.ajax({
      type: "GET",
      url: URI + SEARCH_POSTS_API + $.param(params),
      dataType: "json",
      success: function (response) {
        console.log(response)

        // 沒有搜尋到結果
        if (response.total === 0) {
          addNewQuestion(name, img, side);
        }
        else {

          text = "<h2>這是我搜尋到的結果<br></h2>";

          msgHTML = `<div class="msg ${side}-msg">`;
          msgHTML += `<div class="msg-img" style="background-image: url(${img})"></div>` +
            `<div class="msg-bubble">` +
            `<div class="msg-info">` +
            `<div class="msg-info-name">${name}</div>` +
            `<div class="msg-info-time">${formatDate(new Date())}</div>` +
            `</div><div class="msg-text">${text}`;

          /// 另一種寫法
          // response.article.forEach(function (value) {
          //   msgHTML += '<a href="#" class="question-list" data-question="' + value._id + '" <i>'+value._source.content+'</i> </a><br/>';
          // });

          $.each(response.article, function (key, value) {
            msgHTML += '<a href="#" id="list" class="question-list" data-question="' + value._id + '" <i>[' + key + '] ' + value._source.title + '</i> </a><br/>';
          });

          //msgHTML += `<br>DCT-智能客服是否有幫助回答您問題?<br>`;
          //msgHTML += `<button type="button" class="msg-checkYesBtn" data-type="Y">是</button>`;
          //msgHTML += `<button type="button" class="msg-checkNoBtn" data-type="N" data-target="#feedback-modal">否</button>`;

          msgHTML += `<div class="msg-text"><br>如沒有找到最佳答案請在多輸入其他關鍵字詢問 如 機台 校正、教學 Autolearn_UI,或是點選按鈕進行提問, 相關人員會盡快回覆給您<br></div>`;
          msgHTML += `<button type="button" class="msg-AddQuestion" data-toggle="modal" data-target="#exampleModal" data-whatever="mdo" onclick="selectFiles();">我要提問</button>`

          msgHTML += `</div></div></div>`;
        }
        msgerChat.insertAdjacentHTML("beforeend", msgHTML);
        msgerChat.scrollTop += 500;

      },
      error: function (thrownError) {
        console.log(thrownError);
      }
    });
  });
}

//點選問題事件
$("#chat-room1").on('click', ".question-list", function () {

  var side = "left";
  var name = BOT_NAME;
  var img = BOT_IMG;
  var text = "";
  var response_obj = null;
  var reply_id = "";
  var checkDCTmember = 0;

  const URI = isProduction ? 'https://coknow.kh.asegroup.com/qa_api' : 'http://10.11.66.118/qa_api';
  const SEARCH_POSTS_Token = isProduction ? 'ssAc8ADT7AjnkqfF3m7DtiAj9DuPCLb3Bd6EF4yMOAY' : 'ut8hTpozn9pXN8yE4aSIcmpu3OPzYqXW7qk78riK-kE';
  const GET_POST_API = '/get_post?';

  var questionID = $(this).attr('data-question');

  console.log("question ID: " + questionID);

  var params = {
    token: SEARCH_POSTS_Token,
    q: questionID
  };

  $.ajax({
    type: "GET",
    url: URI + GET_POST_API + $.param(params),
    dataType: "json",
    success: function (response) {

      console.log(response);

      response_obj = Object.assign({}, response);

      msgHTML = `<div class="msg ${side}-msg">`;
      msgHTML += `<div class="msg-img" style="background-image: url(${img})"></div>` +
        `<div class="msg-bubble">` +
        `<div class="msg-info">` +
        `<div class="msg-info-name">${name}</div>` +
        `<div class="msg-info-time">${formatDate(new Date())}</div>` +
        `</div><div class="msg-text">${text}`;

      // 如果只有問題沒有答案
      if (response._source.reply[0] == null) {
        msgHTML += `<p> Q : ${response._source.title}<br> </p>`;
        // 如果沒有附檔
        if (response._source.files[0] == null) {
          msgHTML += `<p> A : ${response._source.content}<br> </p>`;
        }
        else if (response._source.files[0].base64) {
          if (response._source.files[0].name.toLowerCase(), 'jpg' || response._source.files[0].name.toLowerCase(), 'png') {
            msgHTML += `<p> A : <a href="${response._source.files[0].base64}" download = ${response._source.files[0].name} id="FileTag" target="_blank"> ${response._source.files[0].name} <br></a></p>`;
          } else {
            msgHTML += '<a href="' + response._source.files[0].name + '" target="_blank"><i class="fas fa-file-download">下載</i></a>';
          }
        }
      }
      else {

        reply_id = response._source.reply[0].owner.employee_id;
        
        /// 檢查是否為DCT Member
        /// 若是 checkDCTmember == 1;
        /// 不是 checkDCTmember == 0;
        checkDCTmember = 0;
        for (temp of DCT_TeamMember) {
          if (temp == reply_id) {
            checkDCTmember = 1;
            break;
          }
        }

        /// 確認是DCT Member
        if (checkDCTmember == 1) {
          msgHTML += `<p> Q : ${response._source.title}<br> </p>`;
          //msgHTML += `<p> A : ${response._source.reply[0].content}<br> </p>`;

          // 如果沒有附檔
          if (response._source.files[0] == null) {
            msgHTML += `<p> A : ${response._source.reply[0].content}<br> </p>`;
          } else if (response._source.files[0].base64) {
            if (response._source.files[0].name.toLowerCase(), 'jpg' || response._source.files[0].name.toLowerCase(), 'png') {
              msgHTML += `<p> A : <a href="${response._source.files[0].base64}" download = ${response._source.files[0].name} id="FileTag" target="_blank"> ${response._source.files[0].name} <br></a></p>`;
            } else {
              msgHTML += '<a href="' + response._source.files[0].name + '" target="_blank"><i class="fas fa-file-download">下載</i></a>';
            }
          }
          
        }
        else {
          msgHTML += `<p> Q : ${response._source.title}<br> </p>`;
          // 如果沒有附檔
          if (response._source.files[0] == null) {
            msgHTML += `<p> A : ${response._source.content}<br> </p>`;
          } else if (response._source.files[0].base64) {
            if (response._source.files[0].name.toLowerCase(), 'jpg' || response._source.files[0].name.toLowerCase(), 'png') {
              msgHTML += `<p> A : <a href="${response._source.files[0].base64}" download = ${response._source.files[0].name} id="FileTag" target="_blank"> ${response._source.files[0].name} <br></a></p>`;
            } else {
              msgHTML += '<a href="' + response._source.files[0].name + '" target="_blank"><i class="fas fa-file-download">下載</i></a>';
            }
          }
        }
      }

      /// 更新瀏覽人次
      revisePostBrowseContent(response_obj);

      msgHTML += `<br>DCT-智能客服是否有幫助回答您問題?<br>`;
      msgHTML += `<button type="button" id="msg-checkYesBtn" class="msg-checkYesBtn" questionID = ${questionID} data-type="Y">是</button>`;
      msgHTML += `<button type="button" id="msg-checkNoBtn" class="msg-checkNoBtn" questionID = ${questionID} data-type="N" data-target="#feedback-modal">否</button>`;

      msgHTML += `</div></div></div>`;

      msgerChat.insertAdjacentHTML("beforeend", msgHTML);
      msgerChat.scrollTop += 500;
    },
    error: function (thrownError) {
      console.log(thrownError);
    }

  });

});

// 新增問題,執行函式
(function ($) {

  var Base64_encode = "";
  var uploadFile = "";
  var loadedFiles = [];
  var readers = [];

  $.FileDialog = function FileDialog(userOptions) {
    var options = $.extend($.FileDialog.defaults, userOptions),
      modal = $([
        "<div class='modal fade'>",
        "    <div class='modal-dialog'>",
        "        <div class='modal-content'>",
        "            <div class='modal-header'>",
        "                <button type='button' class='close' data-dismiss='modal'>",
        "                    <span aria-hidden='true'>&times;</span>",
        "                    <span class='sr-only'>",
        options.cancel_button,
        "                    </span>",
        "                </button>",
        "                <h4 class='modal-title'>",
        options.title,
        "                </h4>",
        "            </div>",

        "            <div class='modal-body'>",

        "<div class='form-group'>",
        "        <label for='message-text' class='col-form-label message-text-class'>Message:</label>",
        "<textarea class='form-control' id='message-text'></textarea>",
        "</div>",
        "                <input type='file' />",
        "                <div class='bfd-dropfield'>",
        "                    <div class='bfd-dropfield-inner'>",
        options.drag_message,
        "                    </div>",
        "                </div>",
        "                <div class='container-fluid bfd-files'>",
        "                </div>",
        "            </div>",

        "            <div class='modal-footer'>",
        "                <button type='button' class='btn btn-default bfd-cancel'",
        "                                data-dismiss='modal'>",
        options.cancel_button,
        "                </button>",
        "                <button type='button' class='btn btn-primary bfd-ok'>",
        options.ok_button,
        "                </button>",

        "            </div>",

        "        </div>",
        "    </div>",
        "</div>"
      ].join("")),
      done = false,
      input = $("input:file", modal),
      dropfield = $(".bfd-dropfield", modal),
      dropfieldInner = $(".bfd-dropfield-inner", dropfield);

    dropfieldInner.css({
      "height": options.dropheight,
      "padding-top": options.dropheight / 2 - 32
    });

    input.attr({
      "accept": options.accept,
      "multiple": options.multiple
    });

    dropfield.on("click.bfd", function () {
      input.trigger("click");
    });

    var loadFile = function (f) {
      var reader = new FileReader();
      var progressBar;
      var row;

      console.log(f);

      readers.push(reader);

      reader.onerror = function (e) {
        if (e.target.error.code === e.target.error.ABORT_ERR) {
          return;
        }
        progressBar.parent().html([
          "<div class='bg-danger bfd-error-message'>",
          options.error_message,
          "</div>"
        ].join("\n"));
      };

      reader.onprogress = function (e) {
        var percentLoaded = Math.round(e.loaded * 100 / e.total) + "%";
        progressBar.attr("aria-valuenow", e.loaded);
        progressBar.css("width", percentLoaded);
        $(".sr-only", progressBar).text(percentLoaded);
      };

      reader.onload = function (e) {
        f.content = e.target.result;
        loadedFiles.push(f);
        progressBar.removeClass("active");

        Base64_encode = reader.result;
        uploadFile = f;

      };

      //進度條
      var progress = $([
        "<div class='col-xs-7 col-sm-4 bfd-info'>",
        "    <span class='glyphicon glyphicon-remove bfd-remove'></span>&nbsp;",
        "    <span class='glyphicon glyphicon-file'></span>&nbsp;" + f.name,
        "</div>",
        "<div class='col-xs-5 col-sm-8 bfd-progress'>",
        "    <div class='progress'>",
        "        <div class='progress-bar progress-bar-striped active' role='progressbar'",
        "            aria-valuenow='0' aria-valuemin='0' aria-valuemax='" + f.size + "'>",
        "            <span class='sr-only'>0%</span>",
        "        </div>",
        "    </div>",
        "</div>"
      ].join(""));
      progressBar = $(".progress-bar", progress);

      $(".bfd-remove", progress).tooltip({
        "container": "body",
        "html": true,
        "placement": "top",
        "title": options.remove_message
      }).on("click.bfd", function () {

        Base64_encode = "";
        uploadFile = "";

        var idx = loadedFiles.indexOf(f);
        if (idx >= 0) {
          loadedFiles.pop(idx);
        }
        row.fadeOut();
        try { reader.abort(); } catch (e) { }
      });

      row = $("<div class='row'></div>");
      row.append(progress);
      $(".bfd-files", modal).append(row);

      reader["readAs" + options.readAs](f);
    };

    var loadFiles = function loadFiles(flist) {
      Array.prototype.forEach.apply(flist, [loadFile]);

      $.each(flist, function (index, value) {
        console.log(index);
      });
    };

    // setting up event handlers
    input.change(function (e) {
      e = e.originalEvent;
      var files = e.target.files;
      loadFiles(files);
      // clearing input field by replacing it with a clone (lol)
      var newInput = input.clone(true);
      input.replaceWith(newInput);
      input = newInput;

      //Base64,以迴圈傳值
      // $.each(files, function (index, value) {
      //   let r = new FileReader();

      //   // 確認檔案物件
      //   //console.log(value);

      //   // 讀取物件內容
      //   r.readAsDataURL(value);

      //   r.onload = function () {
      //     Base64_encode = r.result;
      //     uploadFile = value;
      //     console.log(index);
      //     //console.log(Base64_encode);
      //   }
      // });
    });


    // // drag&drop stuff
    dropfield.on("dragenter.bfd", function () {
      dropfieldInner.addClass("bfd-dragover");
    }).on("dragover.bfd", function (e) {
      e = e.originalEvent;
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }).on("dragleave.bfd drop.bfd", function () {
      dropfieldInner.removeClass("bfd-dragover");
    }).on("drop.bfd", function (e) {
      e = e.originalEvent;
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files;

      loadFiles(files);
    });

    //按下ok 發送
    $(".bfd-ok", modal).on("click.bfd", function () {
      var event = $.Event("files.bs.filedialog");
      event.files = loadedFiles;
      modal.trigger(event);
      done = true;
      modal.modal("hide");

      const URI = isProduction ? 'https://coknow.kh.asegroup.com/qa_api' : 'http://10.11.66.118/qa_api';
      const SAVE_POSTS_Token = isProduction ? 'PVOQEeFU-u5W6Fvt-GB0wlpHV_KsUo1ImImc2JkL69A' : 'bFS1XSqqmEgiWo9hvGRNRw2lKH6WD-h-4-_yfSQGrAg';
      const SAVE_POSTS_API = '/qa_save_with_token/';

      const date = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

      var files_array = [];

      // 如果沒有上傳圖檔
      if (Base64_encode) {
        console.log(Base64_encode);

        var _files = {};
        _files["name"] = uploadFile.name;
        _files["base64"] = Base64_encode;
        _files["downloadable"] = 1;
        _files["searchable"] = 1;

        files_array.push(_files);
      }

      const JsonObj = {
        _id: "",
        token: SAVE_POSTS_Token,
        ad_account: ASE_ID,
        title: $('#message-text').val(),
        html: $('#message-text').val(),
        content: $('#message-text').val(),
        created: date,
        updated: date,
        status: "解決中",
        files: files_array
      };

      // console.log('Json Data : ' + JSON.stringify(JsonObj));

      $.ajax({
        url: URI + SAVE_POSTS_API,
        data: JSON.stringify(JsonObj),
        type: "POST",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
          // alert("Hello ID: " + response.pid_list + " .\n POST Status: " + response.status);
          alert("新增問題成功" + " .\n POST Status: " + response.status);
        },
        error: function (thrownError) {
          alert("新增問題異常");
          console.log(thrownError);
        }
      });

      Base64_encode = "";
      uploadFile = "";

    });

    modal.on("hidden.bs.modal", function () {
      readers.forEach(function (reader) { try { reader.abort(); } catch (e) { } });
      if (!done) {
        var event = $.Event("cancel.bs.filedialog");
        modal.trigger(event);
      }
      modal.remove();
    });

    $(document.body).append(modal);
    modal.modal();

    return modal;
  };

  $.FileDialog.defaults = {
    "accept": "*", /* e.g. 'image/*' */
    "cancel_button": "Cancle",
    "drag_message": "Add a question file \n (.png/.jpg/.jpeg)",
    "dropheight": 200,
    "error_message": "An error occured while loading file",
    "multiple": true,
    "ok_button": "Send",
    "readAs": "DataURL", /* possible choices: BinaryString, Text, DataURL, ArrayBuffer, */
    "remove_message": "Remove&nbsp;file",
    "title": "新增問題"
  };

})(jQuery);

/// DCT-智能客服 回饋 YES
$("#chat-room1").on('click', ".msg-checkYesBtn", function () {
  var questionID = $(this).attr('questionID');
  //alert("Clieck YES" + "question : " + questionID);

  var isLike = 1;
  var side = "left";
  var name = BOT_NAME;
  var img = BOT_IMG;
  var text = "非常感謝你的回饋，若還有其他問題，請再次輸入問題，DCT智能客服很高興為你解答";

  msgHTML = `<div class="msg ${side}-msg">`;
  msgHTML += `<div class="msg-img" style="background-image: url(${img})"></div>` +
    `<div class="msg-bubble">` +
    `<div class="msg-info">` +
    `<div class="msg-info-name">${name}</div>` +
    `<div class="msg-info-time">${formatDate(new Date())}</div>` +
    `</div><div class="msg-text">${text}`;

  getPostContent(questionID, isLike);

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;

});

// DCT-智能客服 回饋 NO
$("#chat-room1").on('click', ".msg-checkNoBtn", function () {
  var questionID = $(this).attr('questionID');
  //alert("Clieck NO" + "question : " + questionID);

  var isLike = 0;
  var side = "left";
  var name = BOT_NAME;
  var img = BOT_IMG;
  var text = "非常感謝你的回饋，若還有其他問題，請再次輸入問題，DCT智能客服很高興為你解答";

  msgHTML = `<div class="msg ${side}-msg">`;
  msgHTML += `<div class="msg-img" style="background-image: url(${img})"></div>` +
    `<div class="msg-bubble">` +
    `<div class="msg-info">` +
    `<div class="msg-info-name">${name}</div>` +
    `<div class="msg-info-time">${formatDate(new Date())}</div>` +
    `</div><div class="msg-text">${text}`;

  getPostContent(questionID, isLike);

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
});

// 依據ID取得該篇資訊
function getPostContent(PostID, isLike) {

  const URI = isProduction ? 'https://coknow.kh.asegroup.com/qa_api' : 'http://10.11.66.118/qa_api';
  const SEARCH_POSTS_Token = isProduction ? 'ssAc8ADT7AjnkqfF3m7DtiAj9DuPCLb3Bd6EF4yMOAY' : 'ut8hTpozn9pXN8yE4aSIcmpu3OPzYqXW7qk78riK-kE';
  const GET_POST_API = '/get_post?';

  var questionID = PostID;

  console.log("question ID: " + questionID);

  var params = {
    token: SEARCH_POSTS_Token,
    q: questionID
  };

  $.ajax({
    type: "GET",
    url: URI + GET_POST_API + $.param(params),
    dataType: "json",
    success: function (response) {
      //console.log(response);
      revisePostLikeAndDisLikeContent(response, isLike);
    },
    error: function (thrownError) {
      console.log(thrownError);
    }
  });
}

// 修改該篇瀏覽資訊
function revisePostBrowseContent(data) {

  const URI = isProduction ? 'https://coknow.kh.asegroup.com/qa_api' : 'http://10.11.66.118/qa_api';
  const SAVE_POSTS_Token = isProduction ? 'PVOQEeFU-u5W6Fvt-GB0wlpHV_KsUo1ImImc2JkL69A' : 'bFS1XSqqmEgiWo9hvGRNRw2lKH6WD-h-4-_yfSQGrAg';
  const SAVE_POSTS_API = '/qa_save_with_token/';

  var ID = data._id;
  var ad_account = data._source.owner.employee_id;
  var title = data._source.title;
  var html = data._source.html;
  var status = data._source.status;
  var date = new Date((+new Date() + 8 * 3600 * 1000)).toISOString();

  var viewsList = data._source.views.map(function (view) {
    return { created: view.created, email: view.email };
  });
  // console.log("views: " + JSON.stringify(viewsList));

  const myObj = { created: date, email: "CS_" + ASE_ID };
  viewsList.push(myObj);

  const JsonObj = {
    _id: ID,
    token: SAVE_POSTS_Token,
    ad_account,
    title,
    html,
    created: data._source.created,
    updated: data._source.updated,
    status,
    views: viewsList
  };

  // console.log("Json Data : " + JSON.stringify(JsonObj));

  $.ajax({
    url: URI + SAVE_POSTS_API,
    data: JSON.stringify(JsonObj),
    type: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    success: function (response) {
      console.log("更新問題成功" + " .\n POST Status: " + response.status);
      //alert("更新問題成功" + " .\n POST Status: " + response.status);
    },
    error: function (thrownError) {
      // alert("更新問題異常");
      console.log("更新問題異常");
      console.log(thrownError);
    }
  });
}

// 修改該篇點讚與倒讚資訊
function revisePostLikeAndDisLikeContent(data, isLike) {

  const URI = isProduction ? 'https://coknow.kh.asegroup.com/qa_api' : 'http://10.11.66.118/qa_api';
  const SAVE_POSTS_Token = isProduction ? 'PVOQEeFU-u5W6Fvt-GB0wlpHV_KsUo1ImImc2JkL69A' : 'bFS1XSqqmEgiWo9hvGRNRw2lKH6WD-h-4-_yfSQGrAg';
  const SAVE_POSTS_API = '/qa_save_with_token/';

  const ID = data._id;
  const ad_account = data._source.owner.employee_id;
  // const { title, html, status } = data._source;
  const title = data._source.title;
  const html = data._source.html;
  const status = data._source.status;
  const date = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

  let likesOrDislikes = isLike ? data._source.likes : data._source.dislikes;
  likesOrDislikes = likesOrDislikes.map(item => ({ created: item.created, email: item.email }));
  likesOrDislikes.push({ created: date, email: "CS_" + ASE_ID });

  const JsonObj = {
    _id: ID,
    token: SAVE_POSTS_Token,
    ad_account,
    title,
    html,
    created: data._source.created,
    updated: data._source.updated,
    status,
  };

  if (isLike) {
    JsonObj.likes = likesOrDislikes;
  } else {
    JsonObj.dislikes = likesOrDislikes;
  }

  // console.log('Json Data : ' + JSON.stringify(JsonObj));

  $.ajax({
    url: URI + SAVE_POSTS_API,
    data: JSON.stringify(JsonObj),
    type: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    success: function (response) {
      console.log("更新問題成功" + " .\n POST Status: " + response.status);
      //alert("更新問題成功" + " .\n POST Status: " + response.status);
    },
    error: function (thrownError) {
      // alert("更新問題異常");
      console.log("更新問題異常");
      console.log(thrownError);
    }
  });
}

// 紀錄使用者發問內容
function getUserQuestion(ID,text)
{
  $.ajax({
    type: "POST",
    url: "/CustomerService/updateInputText",
    data: '{ID: "' + ID + '" , Text: "' + text + '"}',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (response) {
        console.log(response);
        if (response.status === "PASS") {
            
        }else
        {
          alert("發問異常 請聯繫 DCT-Rich #24574 : " + response.status);
        }        

    },
    failure: function (response) {
        alert(response.responseText);
    },
    error: function (response) {
        alert(response.responseText);
    }
});

}

/*
/// 有附件時,點選跳出下載訊息
$("#chat-room1").on('click', "#FileTag", function () {
  // alert("FileTag click !!");
  
  var fileURL = $(this).attr('fileURL');
  console.log(fileURL);  
  var fileName = $(this).attr('fileName');
  console.log(fileName);

  var Datatype = fileURL.split(';')[0];
  console.log(Datatype);

  // 可能base64 PDF有問題
  const tempLink = document.createElement('a');
  tempLink.href = fileURL;
  tempLink.setAttribute('download',fileName );
  tempLink.click();



  // window.open(fileURL);
  // window.open("data:application/pdf," + encodeURI(fileURL)); 

  // var objbuilder = '';
  // objbuilder += ('<object width="100%" height="100%"      data="data:application/pdf;base64,');
  // objbuilder += (d);
  // objbuilder += ('" type="application/pdf" class="internal">');
  // objbuilder += ('<embed src="data:application/pdf;base64,');
  // objbuilder += (d);
  // objbuilder += ('" type="application/pdf" />');
  // objbuilder += ('</object>');

  // var win = window.open("","_blank","titlebar=yes");
  //       win.document.title = "My Title";
  //       win.document.write('<html><body>');
  //       win.document.write(objbuilder);
  //       win.document.write('</body></html>');

});

*/


// 測試 有附件時點選機制
/*
$("#chat-room1").on('click', "#FileTag", function () {
  alert("FileTag click !!");

  var fileURL = $(this).attr('fileURL');
  // console.log(fileURL);

  // var fileImage = document.createElement("img");
  // fileImage.src = fileURL;

  // console.log(fileImage.src);
  // fileImage.alt = "";
  // fileImage.padding = "15px";
  // fileImage.height = "auto";
  // fileImage.vertical.align = "middle";
  // fileImage.style = "none";


  /// example 1
  // this.href = URL.createObjectURL(
  //   new Blob([d] , {type:'text/html'})
  // );

  /// example 1
  // this.href = URL.createObjectURL(
  //   new Blob([fileURL] , {type:'text/html'})
  // );

  /// example 1
  // this.href = URL.createObjectURL(
  //   // new Blob([fileURL],{type:'image/PNG'})
  //   new Blob([fileURL],{type:'application/pdf'})
  // );

  alert("FileTag done !!");

  /// example 2
  //const a = document.getElementById('#FileTag')
  // a.href = fileURL
  //a.setAttribute('download', 'chart-download')
  // a.target = "_blank";
  //a.click()
  // alert("FileTag click  Done!!");
});
*/

// 輸入ASE_ID
function LogIN_ASE_ID() {
  ASE_ID = prompt('請輸入您的工號 ex : K15668');
  // alert('Hello ' + ASE_ID);
  // 1. 正規表達式過濾 K12345(英文<1>+數字<5>)共6碼;123456(數字<6>)
  // 2. 再輸入一次,若再次錯誤,則啟用系統管理員(k15668)帳號發問,
  //     12/21(三) 會議結論,若找不到人則等待人來找

  var reg = /^[A-Z0-9]{1}[0-9]{4,5}$/;

  if (!reg.test(ASE_ID)) {
    LogInErrorCnt += 1

    if (LogInErrorCnt >= 3) {
      ASE_ID = "K15668";
    }
    else {
      alert('請輸入正確工號(ID) ' + ASE_ID + '錯誤次數 : ' + LogInErrorCnt);
      LogIN_ASE_ID();
    }
  }
}

// 新增問題
function selectFiles() {
  var selectedImages = [];

  $.FileDialog({
    "accept": "image/*"
  }).on("files.bs.FileDialog", function (event) {
    for (var a = 0; a < event.files.length; a++) {
      selectedImages.push(event.files[a]);
      html += "img src='" + event.files[a].content + "' style='width:300px;margin:10px;'>";
    }
    document.getElementById("selected-images").innerHTML = html;
  });
}


// 測試 chat loading
function botResponseLoading() {
  var msgHTML = "";
  var side = "left";
  var name = BOT_NAME;
  var img = BOT_IMG;
  var text = ""; text

  /// 第二種顯示,要思考怎麼隱藏或消失
  msgHTML = `<div class="msg ${side}-msg">`;
  msgHTML += `<div class="msg-img" style="background-image: url(${img})"></div>`;
  msgHTML += '<div class="msg-loading"><figure class="avatar"><img src="../../Resource/typing1.gif"/></figure></div>';

  /// 第一種顯示,GIF位置很奇怪
  // msgHTML = `<div class="msg ${side}-msg">`;
  // msgHTML += `<div class="msg-img" style="background-image: url(${img})"></div>`;
  // msgHTML += `<div class="msg-bubble">`;
  // msgHTML += `<div class="msg-info">`;
  // msgHTML += `<div class="msg-info-name">${name}</div>`;
  // msgHTML += `<div class="msg-info-time">${formatDate(new Date())}</div>`;
  // msgHTML += '<div class="msg-loading"><figure class="avatar"><img src="../../Resource/typing1.gif"/></figure></div>';
  // msgHTML += `<div class="msg-text">${text}`;
  // msgHTML += `</div>`;
  // msgHTML += `</div>`;
  // msgHTML += `</div>`;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

// Reference : https://juejin.cn/post/6956215013858082852
//查找 cookie
function cp_seek_cookie() {
  var cp_keynum = getCookie("cp_keynum");
  ASE_ID = cp_keynum;
}

// Reference : https://juejin.cn/post/6956215013858082852
//获取 cookie 值的函数,创建一个函数用户返回指定 cookie 的值
//cname:名称，你之前设置的名称
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}


// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}
