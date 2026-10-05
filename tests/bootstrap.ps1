$ErrorActionPreference = 'Stop'
$target = Join-Path $PSScriptRoot 'babel.min.cjs'
Invoke-WebRequest 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js' -OutFile $target -UseBasicParsing
$expected = '558A1F7F5FFE218499DCFE5E4FE28D8C890553131B2F718FD4C547BE2E09C484'
if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $expected) { throw 'Babel checksum mismatch' }
Write-Output 'Test compiler ready (Babel 7.23.5).'
