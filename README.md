# Daily Horoscope LineBot
## 0. What is it?
It is a chatbot running in Line, and it can report your daily horoscope based on your zodiac sign and gives you some hints to get through your day.
## 1. How did I make it?
I wrote JavaScript code in `Google Apps Script` to generate a webhook URL, and pasted it on `Line Developer` setup page. I also connected `FireBase` to `Google Apps Script` to store user's data, and connecting `Google Cloud PlateForm` to check logs.  
![structure](/README_PICTURE/lineBot.drawio.png)
## 2. How to run it?
### (0) setup your `LINE OA` / `LINE Developer` / `Google Apps Script` / `FireBase` / `Google Cloud PlateForm`

* how to set up LINE OA?  
https://tw.linebiz.com/account/

* how to set up LINE Developer?  
https://developers.line.biz/en/docs/messaging-api/getting-started/#using-oa-manager

* how to set up Google Apps Script?  
https://medium.com/@dustfantasy/google-app-script-%E5%88%B0%E5%BA%95%E6%98%AF%E4%BB%80%E9%BA%BC-6a37a06a85a8

* how to set up FireBase?  
https://home.gamer.com.tw/creationDetail.php?sn=4447628  
https://www.letswrite.tw/gas-ajax-firebase/#gas-%e5%85%8d%e8%b2%bb%e9%a1%8d%e5%ba%a6%e8%a1%a8  
https://tw.coderbridge.com/series/e8c1bc5b6f2e491c99c59f04b3377c72/posts/50ea213b430b4692a4593bde1d2d43f6  
https://sites.google.com/site/scriptsexamples/new-connectors-to-google-services/firebase/reference

* how to use Logger.log?  
https://www.dotblogs.com.tw/xinyikao/2022/02/05/170535

* how to build flex message?  
https://developers.line.biz/flex-simulator/

* my Notion note  
https://mature-story-0aa.notion.site/Line-87de6291e7034108bb3476a3ac7aacf4

### (1) fill your `LINE BOT Access Token` in the following code.
```javascript
  // put in your own LINE BOT Access Token
  var CHANNEL_ACCESS_TOKEN = 'LINE BOT Access Token';
```
### (2) fill your `FireBase secret key` and `FireBase DataBase url` in the following code.
```javascript
  // FireBase as DB
  // 在firebase頁面建立Realtime Database後 > 專案設定 > 服務帳戶 取得密鑰和url(記得最後補上/)
  const fb_secret = 'FireBase secret key';
  const firebaseUrl = 'FireBase DataBase url';
  var firebase = FirebaseApp.getDatabaseByUrl(firebaseUrl, fb_secret);
```
### (3) fill your own `Horoscope API` in the following code.
```javascript
  // call Horoscope API
  // type: day, week, month
  // dateTime: ex:20200106
  // starType: ex: Capricorn
  function getDailyHoroscope(type, dateTime, starType) {
    var url = 'Horoscope API';
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
```
## 3. Let's play the Bot!
[Click Me to play Daily Horoscope LineBot](https://liff.line.me/1645278921-kWRPP32q/?accountId=642flngn)  
Some screentshoot examples:  
![screenshoot1](/README_PICTUR/screenshoot1.png)
![screenshoot3](/README_PICTUR/screenshoot3.png)
![screenshoot2](/README_PICTUR/screenshoot2.png)