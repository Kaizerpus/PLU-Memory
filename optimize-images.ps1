# Bildoptimering PowerShell Script
# Detta script optimerar bilder för webbanvändning

Write-Host "Startar bildoptimering..." -ForegroundColor Green

# Kontrollera om ImageMagick finns tillgängligt
$imageMagickAvailable = $false
try {
    & magick -version | Out-Null
    $imageMagickAvailable = $true
    Write-Host "ImageMagick hittades - WebP-konvertering aktiverad" -ForegroundColor Green
} catch {
    Write-Host "ImageMagick hittades inte - skippar WebP-konvertering" -ForegroundColor Yellow
    Write-Host "Installera ImageMagick för bästa optimering" -ForegroundColor Cyan
}

# Få alla JPG-bilder i images-mappen
$imageFiles = Get-ChildItem -Path ".\images" -Filter "*.jpg"

Write-Host "Hittade $($imageFiles.Count) bilder att optimera" -ForegroundColor Blue

foreach ($file in $imageFiles) {
    $originalSize = [math]::Round($file.Length / 1KB, 1)
    Write-Host "Optimerar: $($file.Name) ($originalSize KB)" -ForegroundColor Cyan
    
    # Skapa WebP-version om ImageMagick finns
    if ($imageMagickAvailable) {
        $webpPath = $file.FullName.Replace('.jpg', '.webp')
        try {
            # Konvertera till WebP med 85% kvalitet
            & magick $file.FullName -quality 85 $webpPath
            
            if (Test-Path $webpPath) {
                $webpFile = Get-Item $webpPath
                $webpSize = [math]::Round($webpFile.Length / 1KB, 1)
                $savings = [math]::Round((($originalSize - $webpSize) / $originalSize) * 100, 1)
                Write-Host "  WebP skapad: $webpSize KB (sparade $savings%)" -ForegroundColor Green
            }
        } catch {
            Write-Host "  WebP-konvertering misslyckades för $($file.Name)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Bildoptimering klar!" -ForegroundColor Green

# Visa sammanfattning av alla bilder
Write-Host ""
Write-Host "Sammanfattning av bilder:" -ForegroundColor Blue
$allImages = Get-ChildItem -Path ".\images" -Filter "*.*" | Where-Object { $_.Extension -in @('.jpg', '.webp') }
foreach ($img in $allImages) {
    $size = [math]::Round($img.Length / 1KB, 1)
    Write-Host "  $($img.Name): $size KB" -ForegroundColor White
}