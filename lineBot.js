// 會自動讀 doGet, doPost 方法

function doGet() {
  // console.log('hello World')
  // var output = ContentService.createTextOutput();
  // output.append("Hello World!");
  // return output;
}

// doPost
function doPost(e) {

  // 引號內放你的 LINE BOT Access Token
  var CHANNEL_ACCESS_TOKEN = 'LINE BOT Access Token';

  // 以 JSON 格式解析 User 端傳來的 e 資料
  var msg = JSON.parse(e.postData.contents);

  /* 
   * LINE API JSON 解析資訊
   *
   * replyToken : 一次性回覆 token
   * user_id : 使用者 user id，查詢 username 用
   * userMessage : 使用者傳過來的訊息
   * event_type : 訊息事件類型，個人聊天室還是群組
   */
  const replyToken = msg.events[0].replyToken;
  const userMessage = msg.events[0].message.text;
  const user_id = msg.events[0].source.userId;
  const event_type = msg.events[0].source.type;

  // 【參數】執行時的當下時間
  var current_time = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd");
  current_time = current_time.substring(0, 4) + current_time.substring(5, 7) + current_time.substring(8, 10);

  // 【參數】傳訊者的 LINE 帳號名稱
  var user_name = get_user_name();
  function get_user_name() {
    // 判斷為群組成員還是單一使用者
    switch (event_type) {
      case "user":
        var nameurl = "https://api.line.me/v2/bot/profile/" + user_id;
        break;
      case "group":
        var groupid = msg.events[0].source.groupId;
        var nameurl = "https://api.line.me/v2/bot/group/" + groupid + "/member/" + user_id;
        break;
    }

    try {
      //  呼叫 LINE User Info API，以 user ID 取得該帳號的使用者名稱
      var response = UrlFetchApp.fetch(nameurl, {
        "method": "GET",
        "headers": {
          "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
      });
      var namedata = JSON.parse(response);
      var reserve_name = namedata.displayName;
    } catch {
      reserve_name = "not avaliable";
    }
    return String(reserve_name)
  }

  // FireBase as DB
  // 在firebase頁面建立Realtime Database後 > 專案設定 > 服務帳戶 取得密鑰和url(記得最後補上/)
  const fb_secret = 'FireBase密鑰';
  const firebaseUrl = 'FireBase DataBase';
  var firebase = FirebaseApp.getDatabaseByUrl(firebaseUrl, fb_secret);
  // method:
  // #1 firebase set 原有的資料整個覆蓋
  // firebase.setData(key, value);
  // #2 firebase update 跟原有的資料，有不一樣的部份會更新
  // firebase.updateData(key, value);
  // #3 firebase push 原有資料不動，新增一份資料上去
  // firebase.pushData(key, value);
  // #4 firebase get data 讀target裡的資料，填入realtime db裡的路徑
  // firebase.getData(target);
  // (ex)
  // firebase.setData('user_id/' + user_id + '/name', user_name);
  // firebase.setData('user_id/' + user_id + '/birthday', 19971210);
  // var testData = firebase.getData('user_id/' + user_id + '/name');

  // 回傳訊息給line 並傳送給使用者
  function send_to_line(reply_message) {
    var url = 'https://api.line.me/v2/bot/message/reply';
    UrlFetchApp.fetch(url, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      },
      'method': 'post',
      'payload': JSON.stringify({
        'replyToken': replyToken,
        'messages': reply_message,
      }),
    });
  }

  // 將輸入值 word 轉為 LINE 文字訊息格式之 JSON
  function format_text_message(word) {
    let text_json = [{
      "type": "text",
      "text": word
    }]

    return text_json;
  }

  // 選單
  // https: //developers.line.biz/flex-simulator/
  function flex_message() {
    let text_json = [{
      'type': 'flex',
      'altText': '朋友，今天使用星座運勢了嗎?',
      'contents': {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [{
            "type": "text",
            "text": "你今天好嗎?",
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "lg",
            "spacing": "sm",
            "contents": [{
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [{
                "type": "text",
                "text": "請選擇",
                "wrap": true,
                "color": "#666666",
                "size": "sm",
                "flex": 5
              }]
            }]
          }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [{
            "type": "button",
            "style": "primary",
            "height": "sm",
            "action": {
              "type": "message",
              "label": "今日運勢",
              "text": "今日運勢"
            },
            "color": "#9900ff"
          },
          {
            "type": "button",
            "style": "primary",
            "height": "sm",
            "action": {
              "type": "message",
              "label": "變更生日",
              "text": "變更生日"
            },
            "color": "#9900ff"
          },
          {
            "type": "button",
            "style": "primary",
            "height": "sm",
            "action": {
              "type": "message",
              "label": "每日貼心提醒",
              "text": "每日貼心提醒"
            },
            "color": "#9900ff"
          }
          ],
          "flex": 0
        }
      }
    }];

    return text_json;
  }

  // 運勢
  // https: //developers.line.biz/flex-simulator/
  function fate_message(personalInfo, totalFate_stars, totalFate, workFate_stars, workFate, loveFate_stars, loveFate, moneyFate_stars, moneyFate) {
    let text_json = [{
      'type': 'flex',
      'altText': '朋友，今天使用星座運勢了嗎?',
      'contents': {
        "type": "carousel",
        "contents": [
          {
            "type": "bubble",
            "size": "micro",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": personalInfo,
                  "weight": "bold",
                  "size": "sm",
                  "size": "18px",
                  "wrap": true
                }
              ],
              "spacing": "sm",
              "paddingAll": "13px",
              "position": "relative"
            }
          },
          {
            "type": "bubble",
            "size": "micro",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "總體運",
                  "weight": "bold",
                  "size": "sm",
                  "wrap": true
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": totalFate_stars
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": totalFate,
                          "wrap": true,
                          "color": "#8c8c8c",
                          "size": "xs",
                          "flex": 5
                        }
                      ]
                    }
                  ]
                }
              ],
              "spacing": "sm",
              "paddingAll": "13px",
              "position": "relative"
            }
          },
          {
            "type": "bubble",
            "size": "micro",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "工作運",
                  "weight": "bold",
                  "size": "sm",
                  "wrap": true
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": workFate_stars
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": workFate,
                          "wrap": true,
                          "color": "#8c8c8c",
                          "size": "xs",
                          "flex": 5
                        }
                      ]
                    }
                  ]
                }
              ],
              "spacing": "sm",
              "paddingAll": "13px"
            }
          },
          {
            "type": "bubble",
            "size": "micro",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "感情運",
                  "weight": "bold",
                  "size": "sm"
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": loveFate_stars
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": loveFate,
                          "wrap": true,
                          "color": "#8c8c8c",
                          "size": "xs",
                          "flex": 5
                        }
                      ]
                    }
                  ]
                }
              ],
              "spacing": "sm",
              "paddingAll": "13px"
            }
          },
          {
            "type": "bubble",
            "size": "micro",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "財富運",
                  "weight": "bold",
                  "size": "sm"
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": moneyFate_stars
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": moneyFate,
                          "wrap": true,
                          "color": "#8c8c8c",
                          "size": "xs",
                          "flex": 5
                        }
                      ]
                    }
                  ]
                }
              ],
              "spacing": "sm",
              "paddingAll": "13px"
            }
          }
        ]
      }
    }];

    return text_json;
  }

  // 產生星星，num輸入有幾個會亮的星星
  function generateStars(num) {
    const bright = {
      "type": "icon",
      "size": "xs",
      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
    };
    const dark = {
      "type": "icon",
      "size": "xs",
      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
    };
    var stars = []
    for (let i = 0; i < num; i++) {
      stars.push(bright);
    }
    while (num < 5) {
      stars.push(dark);
      num++;
    }

    return stars;
  }

  // 對應日期得到星座資訊
  function checkZodiacSigns(birthday) {

    const my_birthday = new Date(birthday);

    const days = [21, 20, 21, 21, 22, 22, 23, 24, 24, 24, 23, 22];
    const signs = ["水瓶座", "雙魚座", "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座"];
    let month = my_birthday.getMonth();
    let day = my_birthday.getDate();
    if (month == 0 && day <= 20) {
      month = 11;
    } else if (day < days[month]) {
      month--;
    }
    return signs[month];
  }

  // new Date()化輸入的資訊
  function modifyBirthday(birthday) {
    const month = birthday.substring(4, 6);
    const day = birthday.substring(6, 8);
    const year = birthday.substring(0, 4);

    return month + "/" + day + "/" + year;
  }

  // 星座中轉英
  function convertZodiacSign(zodiacSign) {
    switch (zodiacSign) {
      case "水瓶座":
        return "Aquarius";
      case "雙魚座":
        return "Pisces";
      case "牡羊座":
        return "Aries";
      case "金牛座":
        return "Taurus";
      case "雙子座":
        return "Gemini";
      case "巨蟹座":
        return "Cancer";
      case "獅子座":
        return "Leo";
      case "處女座":
        return "Virgo";
      case "天秤座":
        return "Libra";
      case "天蠍座":
        return "Scorpio";
      case "射手座":
        return "Sagittarius";
      case "摩羯座":
        return "Capricorn";
    }
  }

  // 呼叫星座API
  // type: day, week, month
  // dateTime: ex:20200106
  // starType: 星座的英文，ex: Capricorn
  function getDailyHoroscope(type, dateTime, starType) {
    var url = '放上星座API';
    var formData = {
      'type': type,
      'dateTime': dateTime,
      'starType': starType
    }
    var options = {
      'method': 'post',
      'payload': formData,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());

    Logger.log("data: " + data);
    return data;
  }

  if (typeof replyToken === 'undefined') {
    return;
  }

  // 0. 啟動flex message & reply_message
  var flex_message = flex_message();
  var reply_message = "";
  var regPos = /^[1-2][0-9][0-9][0-9][0-1][0-9][0-3][0-9]*/;
  var userMessage_change = regPos.test(userMessage) ? "生日成功" : userMessage;

  // 如果資料庫沒有用戶的資料，請用戶去設定生日
  if (userMessage_change !== "生日成功" & firebase.getData('user_id/' + user_id) == null) {
    reply_message = format_text_message("親愛的 " + user_name + " 您好! " + '\n' + "請先輸入生日資訊以使用今日運勢功能哦! 🎂" + '\n' + "ex: 1997年12月7號 生日 👉 19971207");
    send_to_line(reply_message);
  }

  switch (userMessage_change) {

    case "來吧":
      send_to_line(flex_message);
      break;

    case "今日運勢":

      var get_zodiacSignName = firebase.getData('user_id/' + user_id + '/zodiacSign');
      
      var data = getDailyHoroscope('day', current_time, convertZodiacSign(get_zodiacSignName));
      const totalFate_stars = generateStars(data.totalstar);
      const totalFate = data.totaldesc;
      const workFate_stars = generateStars(data.workstar);
      const workFate = data.workdesc;
      const loveFate_stars = generateStars(data.livestar);
      const loveFate = data.livedesc;
      const moneyFate_stars = generateStars(data.moneystar);
      const moneyFate = data.moneydesc;

      var fate_message = fate_message(get_zodiacSignName + " " + user_name + '\n' + "的今日運勢", totalFate_stars, totalFate, workFate_stars, workFate, loveFate_stars, loveFate, moneyFate_stars, moneyFate);
      send_to_line(fate_message);
      break;

    case "變更生日":
      reply_message = format_text_message("請輸入生日資訊🎂" + '\n' + "ex: 1997年12月7號 生日 👉 19971207");
      send_to_line(reply_message);
      break;

    case "生日成功":
      firebase.setData('user_id/' + user_id + '/name', user_name);
      const userMessage_to_birthday = modifyBirthday(userMessage);
      firebase.setData('user_id/' + user_id + '/birthday', userMessage_to_birthday);
      const zodiacSignName = checkZodiacSigns(userMessage_to_birthday);
      firebase.setData('user_id/' + user_id + '/zodiacSign', zodiacSignName);
      reply_message = format_text_message(user_name + " 的生日是☘️ " + userMessage + " ☘️ 屬於 " + zodiacSignName + " ,設定生日成功😊，輸入【來吧】進行接下來的功能!");
      send_to_line(reply_message);
      break;

    case "每日貼心提醒":
      var get_zodiacSignName = firebase.getData('user_id/' + user_id + '/zodiacSign');
      var data = getDailyHoroscope('day', current_time, convertZodiacSign(get_zodiacSignName));
      const honeydesc = data.honeydesc;

      reply_message = format_text_message(honeydesc);
      send_to_line(reply_message);
      break;

    default:
      Logger.log("hello world!");
      reply_message = format_text_message("Hi... Dear " + user_name);
      send_to_line(reply_message);
      break;
  }

}