$files = Get-ChildItem "C:\xampp\htdocs\opd_management_react\src\pages\*.jsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "headers: \{ 'Authorization'.*?\},\s*\n\s*headers: \{ 'Content-Type'") {
        # Merge duplicate headers into one
        $content = $content -replace "headers: \{ 'Authorization': ""Bearer `\$\{getToken\(\)\}"" \},(\s*)headers: \{ 'Content-Type': 'application/json' \},", "headers: { 'Content-Type': 'application/json', 'Authorization': `"Bearer `$`{getToken()}`" },"
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Headers merged: $($file.Name)"
    }
}
Write-Host "Done!"
