# Copy Cladding Solutions logo to public folder
# Run this script from the project root directory

$sourcePath = "C:\Users\teoth\.cursor\projects\c-Users-teoth-OneDrive-Skrivebord-ACM-panel-project\assets"
$destPath = Join-Path $PSScriptRoot "public\logo.png"

# Find the Cladding Solutions logo
$logo = Get-ChildItem $sourcePath | Where-Object { 
    $_.Name -match "ChatGPT_Image_Feb_16" -or 
    $_.Name -match "Cladding" -or
    $_.Name -match "eb1708f1"
}

if ($logo) {
    try {
        # Use robocopy for long paths
        $sourceFile = $logo.FullName
        $tempDest = Join-Path $env:TEMP "logo_temp.png"
        
        # Copy to temp first
        Copy-Item -LiteralPath $sourceFile -Destination $tempDest -Force
        
        # Then copy to final destination
        Copy-Item $tempDest -Destination $destPath -Force
        
        # Clean up
        Remove-Item $tempDest -ErrorAction SilentlyContinue
        
        Write-Host "Successfully copied logo to public\logo.png" -ForegroundColor Green
        Write-Host "Source: $($logo.Name)" -ForegroundColor Gray
    }
    catch {
        Write-Host "Error copying file: $_" -ForegroundColor Red
        Write-Host "Please manually copy the logo image to: public\logo.png" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Logo file not found in assets folder." -ForegroundColor Red
    Write-Host "Please manually copy your Cladding Solutions logo image to: public\logo.png" -ForegroundColor Yellow
}
