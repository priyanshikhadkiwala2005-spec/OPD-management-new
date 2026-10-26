$files = Get-ChildItem "C:\xampp\htdocs\opd_management_react\src\pages\*.jsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "credentials: 'include'") {
        $content = $content -replace "credentials: 'include',", "headers: { 'Authorization': `"Bearer `$`{getToken()}`" },"
        $content = $content -replace "credentials: 'include'", "headers: { 'Authorization': `"Bearer `$`{getToken()}`" }"
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}
Write-Host "All done!"
