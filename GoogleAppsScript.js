/**
 * Google Apps Script - AI 영상공방 구글 스프레드시트 연동용 백엔드 코드
 * 
 * [설치 방법]
 * 1. 연동할 구글 스프레드시트를 생성합니다.
 * 2. 첫 번째 행(Header)에 아래와 같이 정확히 열 제목을 작성합니다 (A열부터 H열까지):
 *    A열: ID
 *    B열: 신청일시
 *    C열: 신청자
 *    D열: 연락처
 *    E열: 이메일
 *    F열: 신청 서비스
 *    G열: 상태
 *    H열: 상세내용
 * 3. 스프레드시트 상단 메뉴에서 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 4. 기존 코드를 모두 지우고 본 파일의 코드를 복사해서 붙여넣습니다.
 * 5. 상단 메뉴의 [배포] > [새 배포]를 클릭합니다.
 * 6. 유형 선택(톱니바퀴)에서 [웹앱]을 선택합니다.
 * 7. 아래 설정을 지정합니다:
 *    - 설명: AI 영상공방 연동 API
 *    - 웹앱을 실행할 사용자: 나 (사용자 본인의 구글 계정)
 *    - 액세스할 수 있는 사용자: 모든 사용자 (Anyone) -> 중요! 로그인 없이 프론트엔드에서 접근하기 위해 필수입니다.
 * 8. [배포] 버튼을 클릭하고 액세스 승인(구글 계정 권한 허용)을 완료합니다.
 * 9. 생성된 "웹앱 URL"을 복사하여 아래 파일들의 GOOGLE_SHEET_WEB_APP_URL 변수에 붙여넣습니다:
 *    - admin.html
 *    - script.js
 *    - m/admin.html
 *    - m/script.js
 */

// 관리자 알림용 수신 이메일 주소
var ADMIN_NOTIFICATION_EMAIL = 'jgg2010@naver.com';

// 디스코드 알림용 웹훅 URL (여기에 복사한 디스코드 웹훅 URL을 붙여넣으세요)
var DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1520651798006988890/WtHrU--JR-0b15C5uAJV9-E9TORjoeraDntp7Vw8zmLKzT6Yy-G-VRjsIaVD1r5pZlfy';

// 1. GET 요청 처리 (데이터 조회 및 상태 업데이트)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 연동 스프레드시트가 휴지통에 있는지 검사
    try {
      if (DriveApp.getFileById(ss.getId()).isTrashed()) {
        return createJsonResponse({ result: 'error', message: '연동된 구글 스프레드시트가 휴지통에 있습니다. 구글 드라이브 휴지통을 확인하거나 새 시트를 연동해 주세요.' });
      }
    } catch (driveErr) {
      Logger.log("구글 드라이브 상태 확인 실패 (DriveApp 권한 필요): " + driveErr.toString());
    }

    var sheet = ss.getSheets()[0];
    var action = e.parameter.action;
    var requestEmail = e.parameter.email;
    var adminKey = e.parameter.key;

    // 1-C. 신규 회원가입 웰컴 이메일 전송 처리 (?action=sendWelcomeEmail&email=이메일&name=이름)
    if (action === 'sendWelcomeEmail') {
      var customerEmail = e.parameter.email;
      var customerName = e.parameter.name || '고객';
      if (customerEmail && customerEmail.indexOf('@') !== -1) {
        try {
          // 1) 고객용 웰컴 이메일 발송
          var subject = "[AI 영상공방] 신규 회원가입을 축하드립니다!";
          var body = customerName + " 고객님, 안녕하세요.\n" +
            "AI 영상공방의 회원이 되신 것을 진심으로 환영합니다!\n\n" +
            "저희 AI 영상공방은 최신 AI 기술과 기획/연출 노하우를 결합하여 최고의 광고 영상 및 웹 서비스를 제공하고 있습니다.\n\n" +
            "이제 언제든지 로그인 후 마이페이지를 통해 신청하신 제작 상담건의 진행 상태를 편리하게 실시간으로 확인하실 수 있습니다.\n\n" +
            "■ 마이페이지 제공 기능:\n" +
            "- 접수하신 제작 문의 내역 및 답변 실시간 확인\n" +
            "- 새로운 기획서 및 견적 무료 상담 신청\n\n" +
            "감사합니다.\n" +
            "AI 영상공방 드림\n";

          MailApp.sendEmail(customerEmail, subject, body);

          // 2) 관리자용 회원가입 알림 이메일 발송
          try {
            var adminSubject = "[AI 영상공방-알림] 신규 회원이 가입했습니다 (" + customerName + ")";
            var adminBody = "AI 영상공방에 새로운 회원이 가입했습니다.\n\n" +
              "■ 가입 회원 이름: " + customerName + "\n" +
              "■ 가입 회원 이메일: " + customerEmail + "\n" +
              "■ 가입 일시: " + formatDate(new Date()) + "\n\n" +
              "관리자 대시보드 또는 Firebase Console에서 회원 계정을 확인하실 수 있습니다.\n";
            MailApp.sendEmail(ADMIN_NOTIFICATION_EMAIL, adminSubject, adminBody);
          } catch (adminMailErr) {
            Logger.log("관리자 회원가입 알림 메일 발송 실패: " + adminMailErr.toString());
          }

          // 3) 관리자용 회원가입 알림 디스코드 전송
          try {
            var discordMessage = "🆕 **[신규 회원가입 알림]**\n" +
              "• **가입자 이름**: " + customerName + "\n" +
              "• **이메일 주소**: " + customerEmail + "\n" +
              "• **가입 일시**: " + formatDate(new Date());
            sendDiscordNotification(discordMessage);
          } catch (discordErr) {
            Logger.log("디스코드 회원가입 알림 전송 실패: " + discordErr.toString());
          }

          return createJsonResponse({ result: 'success', message: '웰컴 메일 및 관리자 알림을 발송했습니다.' });
        } catch (mailErr) {
          return createJsonResponse({ result: 'error', message: mailErr.toString() });
        }
      }
      return createJsonResponse({ result: 'error', message: '유효하지 않은 이메일 주소입니다.' });
    }

    // 1-A. 문의 상태 업데이트 액션 처리 (?action=updateStatus&id=ID값&status=상태값)
    if (action === 'updateStatus') {
      var id = parseInt(e.parameter.id);
      var status = e.parameter.status;

      if (isNaN(id) || !status) {
        return createJsonResponse({
          result: 'error',
          message: '필수 파라미터(id, status)가 누락되었거나 올바르지 않습니다. (받은 값 - id: "' + e.parameter.id + '", status: "' + e.parameter.status + '")'
        });
      }

      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var found = false;

      // 2번째 행(index 1)부터 검사하여 ID가 일치하는 행을 찾음
      for (var i = 1; i < values.length; i++) {
        var rowId = parseInt(values[i][0]);
        if (rowId === id) {
          // G열(7번째 열)은 상태값 컬럼입니다. (1부터 시작하므로 인덱스는 i+1 행, 7열)
          sheet.getRange(i + 1, 7).setValue(status);
          found = true;

          // 만약 상태가 'done' (상담 완료)으로 변경되었을 경우 고객에게 이메일 알림 전송
          if (status === 'done') {
            var customerName = values[i][2];
            var customerEmail = values[i][4];
            var serviceType = values[i][5];

            var serviceText = "";
            if (serviceType === 'ad') serviceText = "AI 광고 영상";
            else if (serviceType === 'web') serviceText = "홈페이지 제작";
            else if (serviceType === 'shorts') serviceText = "쇼츠 제작";
            else if (serviceType === 'animation') serviceText = "3D 애니메이션";
            else if (serviceType === 'ccm') serviceText = "뮤직비디오";
            else serviceText = "기타/대기";

            if (customerEmail && customerEmail.indexOf('@') !== -1) {
              try {
                var subject = "[AI 영상공방] 신청하신 상담/제작 문의 완료 안내";
                var body = customerName + " 고객님, 안녕하세요.\n" +
                  "AI 영상공방을 찾아주셔서 진심으로 감사드립니다.\n\n" +
                  "고객님께서 신청하신 [" + serviceText + "] 관련 상담 및 견적 기획서 작업이 완료되어 안내해 드립니다.\n" +
                  "상세 내용 및 답변은 홈페이지 마이페이지(My Page)에 로그인하여 실시간으로 확인하실 수 있습니다.\n\n" +
                  "추가적인 문의사항이 있으시면 언제든지 편하게 문의 남겨주시기 바랍니다.\n\n" +
                  "감사합니다.\n" +
                  "AI 영상공방 드림\n";

                MailApp.sendEmail(customerEmail, subject, body);
              } catch (mailErr) {
                Logger.log("이메일 발송 실패 (ID: " + id + "): " + mailErr.toString());
              }
            }
          }
          break;
        }
      }

      if (found) {
        return createJsonResponse({ result: 'success', message: '상태가 성공적으로 업데이트되었습니다.' });
      } else {
        return createJsonResponse({ result: 'error', message: '해당 ID(' + id + ')를 가진 문의 내역을 찾을 수 없습니다.' });
      }
    }

    // 1-B. 문의 목록 조회 처리
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var inquiries = [];

    var targetEmail = requestEmail ? requestEmail.toLowerCase().trim() : '';

    // 보안 검증: 이메일 필터가 없고 올바른 관리자 키도 없는 경우 접근 차단
    if (!targetEmail && (!action || action !== 'adminList' || adminKey !== 'admin_secret_key_2026')) {
      return createJsonResponse({ result: 'error', message: '접근 권한이 없습니다. 이메일 또는 관리자 보안 키가 필요합니다.' });
    }

    // Header(index 0)를 제외하고 데이터를 파싱합니다.
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (row[0] === "" || row[0] === undefined) continue; // 빈 행 스킵

      var emailInRow = String(row[4]).toLowerCase().trim();

      // 일반 회원용: 특정 이메일로 필터링 요청인 경우 일치하는 건만 담음
      if (targetEmail && emailInRow !== targetEmail) {
        continue;
      }

      inquiries.push({
        id: Number(row[0]),
        date: formatDate(row[1]),
        name: String(row[2]),
        phone: String(row[3]),
        email: String(row[4]),
        service: String(row[5]),
        status: String(row[6]),
        message: String(row[7])
      });
    }

    // ID 기준으로 내림차순(최신순) 정렬하여 뿌려줍니다.
    inquiries.sort(function (a, b) {
      return b.id - a.id;
    });

    return createJsonResponse(inquiries);

  } catch (error) {
    return createJsonResponse({ result: 'error', message: error.toString() });
  }
}

// 2. POST 요청 처리 (신규 문의 제출 등록)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 연동 스프레드시트가 휴지통에 있는지 검사
    try {
      if (DriveApp.getFileById(ss.getId()).isTrashed()) {
        return createJsonResponse({ result: 'error', message: '연동된 구글 스프레드시트가 휴지통에 있습니다. 구글 드라이브 휴지통을 확인하거나 새 시트를 연동해 주세요.' });
      }
    } catch (driveErr) {
      Logger.log("구글 드라이브 상태 확인 실패 (DriveApp 권한 필요): " + driveErr.toString());
    }

    var sheet = ss.getSheets()[0];

    // Form 데이터 파라미터 읽기
    var name = e.parameter.name || '';
    var phone = e.parameter.phone || '';
    var email = e.parameter.email || '';
    var service = e.parameter.service || '';
    var message = e.parameter.message || '';

    if (!name || !phone) {
      return createJsonResponse({ result: 'error', message: '필수 항목(이름, 연락처)이 누락되었습니다.' });
    }

    // 고유 ID 생성 (기존 최대 ID + 1)
    var lastRow = sheet.getLastRow();
    var nextId = 1;
    if (lastRow > 1) {
      var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      var maxId = 0;
      for (var i = 0; i < values.length; i++) {
        var id = parseInt(values[i][0]);
        if (!isNaN(id) && id > maxId) {
          maxId = id;
        }
      }
      nextId = maxId + 1;
    }

    // 현재 일시 생성 및 포맷팅
    var dateString = formatDate(new Date());

    // 시트에 새 행 추가: ID, 신청일시, 신청자, 연락처, 이메일, 신청 서비스, 상태(기본 wait), 상세내용
    sheet.appendRow([
      nextId,
      dateString,
      name,
      phone,
      email,
      service,
      'wait', // 초기 상태는 '상담 대기'
      message
    ]);

    // 고객에게 제작 문의 접수 완료 안내 이메일 발송
    if (email && email.indexOf('@') !== -1) {
      try {
        var serviceText = "";
        if (service === 'ad') serviceText = "AI 광고 영상";
        else if (service === 'web') serviceText = "홈페이지 제작";
        else if (service === 'shorts') serviceText = "쇼츠 제작";
        else if (service === 'animation') serviceText = "3D 애니메이션";
        else if (service === 'ccm') serviceText = "뮤직비디오";
        else serviceText = "기타/대기";

        // 1) 고객에게 확인 메일 발송
        var subject = "[AI 영상공방] 신청하신 제작 상담 문의가 정상 접수되었습니다";
        var body = name + " 고객님, 안녕하세요.\n" +
          "AI 영상공방에 제작 상담을 신청해 주셔서 대단히 감사드립니다.\n\n" +
          "보내주신 문의 사항은 담당 기획자가 확인한 후 신속하게 기획 설계안과 함께 연락해 드릴 예정입니다.\n\n" +
          "[상담 접수 내역 요약]\n" +
          "■ 신청번호: #" + nextId + "\n" +
          "■ 신청일시: " + dateString + "\n" +
          "■ 신청 서비스: " + serviceText + "\n" +
          "■ 진행 상태: 상담 대기\n\n" +
          "문의 상세 내역 및 실시간 답변 상황은 언제든지 홈페이지 마이페이지(My Page)에 가입/로그인하여 확인하실 수 있습니다.\n\n" +
          "감사합니다.\n" +
          "AI 영상공방 드림\n";

        MailApp.sendEmail(email, subject, body);

        // 2) 관리자에게 상담 신청 접수 알림 발송
        try {
          var adminSubject = "[AI 영상공방-알림] 새로운 제작 상담 문의가 접수되었습니다 (#" + nextId + ")";
          var adminBody = "AI 영상공방에 새로운 제작 상담 문의가 등록되었습니다.\n\n" +
            "[신청 상세 정보]\n" +
            "■ 신청번호: #" + nextId + "\n" +
            "■ 신청자: " + name + "\n" +
            "■ 연락처: " + phone + "\n" +
            "■ 이메일: " + email + "\n" +
            "■ 신청 서비스: " + serviceText + "\n" +
            "■ 신청일시: " + dateString + "\n\n" +
            "[상세 요구사항 및 내용]\n" +
            message + "\n\n" +
            "관리자 대시보드(admin.html) 또는 구글 스프레드시트에서 상세한 내용을 확인해 주세요.\n";

          MailApp.sendEmail(ADMIN_NOTIFICATION_EMAIL, adminSubject, adminBody);
        } catch (adminMailErr) {
          Logger.log("관리자 문의 알림 메일 발송 실패 (ID: " + nextId + "): " + adminMailErr.toString());
        }

        // 3) 관리자용 상담 신청 디스코드 전송
        try {
          var discordMessage = "📝 **[새로운 상담/제작 문의 접수] (#" + nextId + ")**\n" +
            "• **신청자**: " + name + "\n" +
            "• **연락처**: " + phone + "\n" +
            "• **이메일**: " + email + "\n" +
            "• **신청 서비스**: " + serviceText + "\n" +
            "• **신청일시**: " + dateString + "\n\n" +
            "💬 **[상세 요구사항 및 내용]**\n" +
            message;
          sendDiscordNotification(discordMessage);
        } catch (discordErr) {
          Logger.log("디스코드 문의 알림 전송 실패 (ID: " + nextId + "): " + discordErr.toString());
        }

      } catch (mailErr) {
        Logger.log("문의 접수 웰컴 이메일 발송 실패 (ID: " + nextId + "): " + mailErr.toString());
      }
    }

    return createJsonResponse({ result: 'success', id: nextId });

  } catch (error) {
    return createJsonResponse({ result: 'error', message: error.toString() });
  }
}

// 공통 JSON 응답 포맷팅 및 CORS 우회 지원
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 일시 포맷 변환 유틸리티 (YYYY-MM-DD HH:MM)
function formatDate(dateVal) {
  if (!dateVal) return '';

  // 구글 시트 날짜 객체 처리
  if (dateVal instanceof Date) {
    var yyyy = dateVal.getFullYear();
    var mm = String(dateVal.getMonth() + 1).padStart(2, '0');
    var dd = String(dateVal.getDate()).padStart(2, '0');
    var hh = String(dateVal.getHours()).padStart(2, '0');
    var min = String(dateVal.getMinutes()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min;
  }

  return String(dateVal);
}

// 디스코드 웹훅 알림 발송 유틸리티 함수
function sendDiscordNotification(content) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === 'YOUR_DISCORD_WEBHOOK_URL_HERE' || DISCORD_WEBHOOK_URL.trim() === '') {
    Logger.log("디스코드 웹훅 URL이 설정되지 않았습니다.");
    return;
  }

  var payload = {
    "content": content
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options);
    Logger.log("디스코드 전송 결과: " + response.getContentText());
  } catch (e) {
    Logger.log("디스코드 전송 중 에러 발생: " + e.toString());
  }
}

// 이메일 및 디스코드 발송 권한 테스트 함수
function testNotification() {
  Logger.log("이메일 발송 권한 테스트 시작...");
  try {
    MailApp.sendEmail(ADMIN_NOTIFICATION_EMAIL, "[AI 영상공방] 테스트 메일", "테스트 이메일이 성공적으로 발송되었습니다!");
    Logger.log("이메일 발송 완료! 수신 메일함(jgg2010@naver.com)을 확인해 보세요.");
  } catch (err) {
    Logger.log("이메일 발송 에러: " + err.toString());
  }
  
  Logger.log("디스코드 발송 권한 테스트 시작...");
  try {
    sendDiscordNotification("📢 **[연동 테스트 성공]** 디스코드 알림이 성공적으로 전송되었습니다!");
    Logger.log("디스코드 전송 완료! 디스코드 알림방을 확인해 보세요.");
  } catch (err) {
    Logger.log("디스코드 전송 에러: " + err.toString());
  }
}

