$dir = "c:\xampp\htdocs\general_report_card"
$htmlFiles = Get-ChildItem "$dir\*.html"

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'storage\.js\?v=\d+', 'storage.js?v=10'
    $content = $content -replace 'app\.js\?v=\d+', 'app.js?v=10'
    $content = $content -replace 'settings\.js\?v=\d+', 'settings.js?v=10'
    Set-Content $file.FullName $content -NoNewline
    Write-Host "Updated: $($file.Name)"
}

Write-Host "Done! All HTML files updated to v=10"
