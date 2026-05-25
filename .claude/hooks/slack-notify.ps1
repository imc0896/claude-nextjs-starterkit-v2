# Claude Code Hooks → Slack 알림 스크립트
# 이벤트: Notification(권한 요청), Stop(작업 완료)

[Console]::InputEncoding = [System.Text.Encoding]::UTF8

try {
  $inputJson = [Console]::In.ReadToEnd()
  if (-not $inputJson) { exit 0 }

  $data = $inputJson | ConvertFrom-Json

  $envFile = Join-Path $data.cwd ".env"
  if (-not (Test-Path $envFile)) {
    [Console]::Error.WriteLine(".env file not found at $envFile")
    exit 0
  }
  $webhookUrl = $null
  Get-Content $envFile | ForEach-Object {
    if ($_ -match "^SLACK_WEBHOOK_URL=(.+)$") {
      $webhookUrl = $Matches[1].Trim()
    }
  }
  if (-not $webhookUrl) {
    [Console]::Error.WriteLine("SLACK_WEBHOOK_URL not found in .env")
    exit 0
  }

  $eventName = $data.hook_event_name
  $cwd = $data.cwd
  $projectName = if ($cwd) { Split-Path $cwd -Leaf } else { "unknown" }
  $sessionId = if ($data.session_id) { $data.session_id.Substring(0, [Math]::Min(8, $data.session_id.Length)) } else { "N/A" }
  $message = if ($data.message) {
    $data.message
  } elseif ($data.last_assistant_message) {
    $msg = $data.last_assistant_message -replace '[\r\n]+', ' '
    if ($msg.Length -gt 100) { $msg.Substring(0, 100) + "..." } else { $msg }
  } else {
    "작업 완료"
  }
  $timestamp = Get-Date -Format "HH:mm:ss"

  $fallbackText = ""
  $blocks = @()

  switch ($eventName) {
    "Notification" {
      $toolName = if ($data.tool_name) { $data.tool_name } else { "Unknown" }
      $toolInput = ""
      if ($data.tool_input) {
        if ($data.tool_input.command) {
          $toolInput = $data.tool_input.command
        } elseif ($data.tool_input.file_path) {
          $toolInput = $data.tool_input.file_path
        } else {
          $toolInput = ($data.tool_input | ConvertTo-Json -Compress -Depth 3)
        }
      }
      if ($toolInput.Length -gt 200) {
        $toolInput = $toolInput.Substring(0, 200) + "..."
      }

      $fallbackText = ":warning: Claude Code 권한 요청: $toolName"
      $blocks = @(
        @{
          type = "header"
          text = @{ type = "plain_text"; text = ":warning: 권한 요청"; emoji = $true }
        },
        @{
          type = "section"
          fields = @(
            @{ type = "mrkdwn"; text = "*도구:*`n$toolName" },
            @{ type = "mrkdwn"; text = "*프로젝트:*`n$projectName" },
            @{ type = "mrkdwn"; text = "*메세지:*`n$message" },
            @{ type = "mrkdwn"; text = "*상태:*`n⏳ 대기 중" }
          )
        }
      )

      if ($toolInput) {
        $blocks += @{
          type = "section"
          text = @{ type = "mrkdwn"; text = "*입력:*`n``````$toolInput``````" }
        }
      }

      $blocks += @{
        type = "context"
        elements = @(
          @{ type = "mrkdwn"; text = "세션: ``$sessionId`` | $timestamp" }
        )
      }
    }

    "Stop" {
      $fallbackText = ":white_check_mark: Claude Code 작업 완료"
      $blocks = @(
        @{
          type = "header"
          text = @{ type = "plain_text"; text = ":white_check_mark: 작업 완료"; emoji = $true }
        },
        @{
          type = "section"
          fields = @(
            @{ type = "mrkdwn"; text = "*프로젝트:*`n$projectName" },
            @{ type = "mrkdwn"; text = "*메세지:*`n$message" },
            @{ type = "mrkdwn"; text = "*시간:*`n$timestamp" },
            @{ type = "mrkdwn"; text = "*상태:*`n✅ 완료" }
          )
        },
        @{
          type = "context"
          elements = @(
            @{ type = "mrkdwn"; text = "세션: ``$sessionId``" }
          )
        }
      )
    }

    default {
      exit 0
    }
  }

  $payload = @{
    text = $fallbackText
    blocks = $blocks
  } | ConvertTo-Json -Depth 10 -Compress

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  Invoke-RestMethod -Uri $webhookUrl -Method Post -ContentType "application/json; charset=utf-8" -Body $bytes | Out-Null

} catch {
  [Console]::Error.WriteLine("Slack notify error: $_")
  exit 0
}
