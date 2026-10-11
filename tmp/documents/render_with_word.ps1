$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$documentPath = Join-Path $taskRoot 'output\documents\Hoja de ruta Batalla Naval.docx'
$previewDirectory = Join-Path $PSScriptRoot 'qa'
New-Item -ItemType Directory -Path $previewDirectory -Force | Out-Null
$pdfPath = Join-Path $previewDirectory 'Hoja de ruta Batalla Naval.pdf'
$wordApp = $null
$wordDocument = $null
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    $wordApp.AutomationSecurity = 3
    $wordDocument = $wordApp.Documents.Open($documentPath, $false, $true, $false)
    $wordDocument.Repaginate()
    $wordDocument.ExportAsFixedFormat($pdfPath, 17)
    Write-Output ('Pages: ' + $wordDocument.ComputeStatistics(2))
    Write-Output $pdfPath
}
finally {
    if ($null -ne $wordDocument) {
        $wordDocument.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordDocument)
    }
    if ($null -ne $wordApp) {
        $wordApp.Quit(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApp)
    }
}
