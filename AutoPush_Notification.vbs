Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c chcp 65001 && node git_bot.js", 0, True
MsgBox "🎉 تم رفع جميع التحديثات بنجاح إلى GitHub!" & vbCrLf & "https://github.com/storedeeb2020-dot/deebstore.git", 64, "ELDEEB STORE — GitHub Auto Push"
