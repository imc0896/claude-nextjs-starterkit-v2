#!/usr/bin/env node
/**
 * 하이웍스 메일 MCP 서버 (로컬 수정본)
 *
 * 원본: hiworks-mail-mcp@1.0.12 (MIT, Beyless AI)
 * 변경점:
 * - username/password를 도구 입력 schema에서 제거 → 서버 내부에서 환경변수로만 읽음
 *   (원본은 환경변수 값을 zod default로 넣어 schema에 평문 비밀번호가 노출됨)
 * - read_username 응답에서 password 제거
 * - read_email: STAT 응답 파싱 버그 수정, 메일 미발견 시 에러 반환, 첨부파일 목록 추가
 * - save_attachment 도구 추가 (첨부파일 로컬 저장)
 * - 날짜 표기를 KST 오프셋(+09:00)으로 수정 (원본은 KST 시각에 Z를 붙임)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import Pop3Command from 'node-pop3';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SERVER_NAME = 'hiworks-mail-mcp';
const SERVER_VERSION = '1.0.12-local.2';

const POP3_CONFIG = { host: 'pop3s.hiworks.com', port: 995, tls: true };
const SMTP_CONFIG = { host: 'smtps.hiworks.com', port: 465, secure: true };
const POP3_TIMEOUT_MS = 60_000;

const DEFAULT_SEARCH_LIMIT = 100;
// read_email이 헤더를 탐색할 최대 메일 수 (search_email 기본 조회 범위와 동일)
const FIND_EMAIL_SCAN_LIMIT = DEFAULT_SEARCH_LIMIT;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const NO_SUBJECT = '(제목 없음)';
const NO_FILENAME = '(파일명 없음)';
const KST_OFFSET_SUFFIX = '+09:00';
// 첨부파일 저장 기본 경로 (HIWORKS_ATTACHMENT_DIR로 변경 가능, 상대경로는 서버 실행 위치 기준)
const DEFAULT_ATTACHMENT_DIR = path.join('downloads', 'hiworks');
// Windows/Unix 파일명에 쓸 수 없는 문자
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;

/**
 * 개발 모드에서만 stderr로 로그를 남긴다. (stdout은 MCP 프로토콜 전용이라 사용 불가)
 * @param {...unknown} args 로그 내용
 */
function log(...args) {
  if (process.env.NODE_ENV === 'development') {
    console.error(new Date().toISOString(), ...args);
  }
}

/**
 * 환경변수에서 하이웍스 계정 정보를 읽는다.
 * @returns {{ username: string, password: string }}
 */
function getCredentials() {
  const username = process.env.HIWORKS_USERNAME;
  const password = process.env.HIWORKS_PASSWORD;
  if (!username || !password) {
    throw new Error('HIWORKS_USERNAME / HIWORKS_PASSWORD 환경변수가 설정되지 않았습니다.');
  }
  return { username, password };
}

/**
 * Date를 KST 기준 ISO 문자열로 변환한다. (예: 2026-09-29T09:35:59.000+09:00)
 * 원본은 KST 시각에 UTC 표기(Z)를 붙여 9시간 오차로 오해될 수 있었다.
 * @param {Date | undefined} date 변환할 날짜
 * @returns {string}
 */
function formatDate(date) {
  const base = date ?? new Date();
  return new Date(base.getTime() + KST_OFFSET_MS).toISOString().replace('Z', KST_OFFSET_SUFFIX);
}

/**
 * mailparser 주소 객체를 문자열로 변환한다.
 * @param {{ text?: string } | Array<{ text?: string }> | undefined} address mailparser 주소 객체
 * @returns {string}
 */
function addressText(address) {
  if (Array.isArray(address)) return address[0]?.text || '';
  return address?.text || '';
}

/**
 * 파싱된 메일에서 공통 헤더 정보를 뽑는다.
 * @param {any} parsed mailparser로 파싱된 메일
 * @param {number} msgNum POP3 메시지 번호
 */
function toEmailSummary(parsed, msgNum) {
  return {
    id: parsed.messageId || String(msgNum),
    subject: parsed.subject || NO_SUBJECT,
    from: addressText(parsed.from),
    to: addressText(parsed.to),
    date: formatDate(parsed.date),
  };
}

/**
 * 파싱된 메일의 첨부파일 메타데이터 목록을 만든다. (본문 바이너리는 제외)
 * @param {any} parsed mailparser로 파싱된 메일
 * @returns {Array<{ filename: string, contentType: string, size: number }>}
 */
function toAttachmentList(parsed) {
  return (parsed.attachments || [])
    .filter((attachment) => attachment.contentDisposition !== 'inline')
    .map((attachment) => ({
      filename: attachment.filename || NO_FILENAME,
      contentType: attachment.contentType,
      size: attachment.size,
    }));
}

/**
 * 객체를 MCP 텍스트 응답으로 감싼다.
 * @param {object} payload 응답 데이터
 */
function jsonResult(payload) {
  return { content: [{ type: 'text', text: JSON.stringify(payload) }] };
}

/**
 * POP3 클라이언트를 만든다.
 * @returns {Pop3Command}
 */
function createPop3Client() {
  const { username, password } = getCredentials();
  return new Pop3Command({ ...POP3_CONFIG, user: username, password, timeout: POP3_TIMEOUT_MS });
}

/**
 * 가져올 최신 메시지 번호 목록을 계산한다. (원본 로직 유지)
 * @param {Array<[string, string]>} messageList LIST 결과
 * @param {number} limit 최대 개수
 * @returns {number[]}
 */
function pickLatestMessageNumbers(messageList, limit) {
  if (messageList.length === 0) return [];
  const startIndex = Math.min(messageList.length, Number(messageList[messageList.length - 1][0]));
  const result = [];
  for (let i = startIndex; i > Math.max(1, startIndex - limit); i--) {
    if (messageList.some(([num]) => Number(num) === i)) result.push(i);
  }
  return result;
}

/**
 * 최신 메일 헤더 목록을 조회한다.
 * @param {number} limit 최대 개수
 */
async function fetchLatestEmails(limit) {
  const client = createPop3Client();
  const messageList = await client.LIST();
  const emails = [];
  for (const msgNum of pickLatestMessageNumbers(messageList, limit)) {
    try {
      const parsed = await simpleParser(await client.TOP(msgNum, 0));
      emails.push(toEmailSummary(parsed, msgNum));
    } catch (err) {
      log(`Error processing message ${msgNum}:`, err);
    }
  }
  await client.QUIT();
  return emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 헤더(TOP)만 받아 messageId에 해당하는 POP3 메시지 번호를 찾는다.
 * 전체 본문(RETR)을 받으면 첨부파일까지 내려받아 느리므로 헤더로만 비교한다.
 * @param {Pop3Command} client POP3 클라이언트
 * @param {string} messageId Message-ID 또는 POP3 메시지 번호
 * @returns {Promise<number | undefined>}
 */
async function findMessageNumber(client, messageId) {
  // STAT은 "메일수 전체크기" 문자열을 반환하므로 첫 토큰만 파싱
  const totalMessages = Number.parseInt(String(await client.STAT()).split(' ')[0], 10);
  if (/^\d+$/.test(messageId) && Number(messageId) <= totalMessages) return Number(messageId);
  const lowerBound = Math.max(1, totalMessages - FIND_EMAIL_SCAN_LIMIT + 1);
  for (let i = totalMessages; i >= lowerBound; i--) {
    try {
      const header = await simpleParser(await client.TOP(i, 0));
      if (header.messageId === messageId) return i;
    } catch (err) {
      log(`Error processing email header ${i}:`, err);
    }
  }
  return undefined;
}

/**
 * messageId(또는 메시지 번호)에 해당하는 메일 전체를 받아 파싱한다.
 * @param {string} messageId Message-ID 또는 POP3 메시지 번호
 * @returns {Promise<{ parsed: any, msgNum: number }>}
 */
async function fetchParsedEmail(messageId) {
  const client = createPop3Client();
  try {
    const msgNum = await findMessageNumber(client, messageId);
    // 못 찾으면 undefined가 JSON에서 누락되어 성공처럼 보이므로 명시적으로 실패 처리
    if (!msgNum) throw new Error(`최근 ${FIND_EMAIL_SCAN_LIMIT}건에서 메일을 찾을 수 없습니다: ${messageId}`);
    return { parsed: await simpleParser(await client.RETR(msgNum)), msgNum };
  } finally {
    await client.QUIT();
  }
}

/**
 * messageId(또는 메시지 번호)로 메일 본문과 첨부파일 목록을 가져온다.
 * @param {string} messageId Message-ID 또는 POP3 메시지 번호
 */
async function findEmail(messageId) {
  const { parsed, msgNum } = await fetchParsedEmail(messageId);
  return {
    ...toEmailSummary(parsed, msgNum),
    content: parsed.text || '',
    html: parsed.html || undefined,
    attachments: toAttachmentList(parsed),
  };
}

/**
 * 파일명을 안전하게 정리한다. (경로 탐색 방지 + 금지 문자 치환)
 * @param {string | undefined} filename 원본 파일명
 * @returns {string}
 */
function sanitizeFilename(filename) {
  const cleaned = path.basename(filename || NO_FILENAME).replace(INVALID_FILENAME_CHARS, '_').trim();
  return cleaned || NO_FILENAME;
}

/**
 * 같은 이름의 파일이 있으면 "이름 (2).확장자" 형태로 겹치지 않는 경로를 만든다.
 * @param {string} dir 저장 폴더
 * @param {string} filename 파일명
 * @returns {string}
 */
function uniqueFilePath(dir, filename) {
  const { name, ext } = path.parse(filename);
  let candidate = path.join(dir, filename);
  for (let n = 2; existsSync(candidate); n++) candidate = path.join(dir, `${name} (${n})${ext}`);
  return candidate;
}

/**
 * 메일의 첨부파일을 로컬 폴더에 저장한다. filename을 주면 해당 파일만 저장한다.
 * @param {string} messageId Message-ID 또는 POP3 메시지 번호
 * @param {string} [filename] 저장할 첨부파일명 (생략 시 전체)
 */
async function saveAttachments(messageId, filename) {
  const { parsed } = await fetchParsedEmail(messageId);
  const targets = (parsed.attachments || [])
    .filter((attachment) => attachment.contentDisposition !== 'inline')
    .filter((attachment) => !filename || attachment.filename === filename);
  if (targets.length === 0) throw new Error(filename ? `첨부파일을 찾을 수 없습니다: ${filename}` : '첨부파일이 없습니다.');
  const dir = path.resolve(process.env.HIWORKS_ATTACHMENT_DIR || DEFAULT_ATTACHMENT_DIR);
  await mkdir(dir, { recursive: true });
  const saved = [];
  for (const attachment of targets) {
    const filePath = uniqueFilePath(dir, sanitizeFilename(attachment.filename));
    await writeFile(filePath, attachment.content);
    saved.push({ filename: attachment.filename || NO_FILENAME, path: filePath, size: attachment.size });
  }
  return saved;
}

/**
 * SMTP로 메일을 전송한다.
 * @param {object} mail 전송할 메일 옵션 (from 제외)
 */
async function sendEmail(mail) {
  const { username, password } = getCredentials();
  const transporter = nodemailer.createTransport({ ...SMTP_CONFIG, auth: { user: username, pass: password } });
  const info = await transporter.sendMail({ ...mail, from: username });
  log('Email sent successfully:', info.messageId);
  return info.messageId;
}

/**
 * 도구 핸들러를 감싸 예외를 { success: false, error } 응답으로 바꾼다.
 * @param {(args: any) => Promise<object>} handler 실제 처리 함수
 * @param {object} [failExtra] 실패 응답에 추가할 필드
 */
function safeTool(handler, failExtra = {}) {
  return async (args) => {
    try {
      return jsonResult({ success: true, ...(await handler(args)) });
    } catch (error) {
      log('Tool error:', error);
      return jsonResult({ success: false, ...failExtra, error: error.message });
    }
  };
}

const sendEmailSchema = {
  to: z.string(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  attachments: z
    .array(z.object({ filename: z.string(), content: z.union([z.string(), z.instanceof(Buffer)]) }))
    .optional(),
};

/**
 * MCP 서버를 만들고 도구를 등록한다. (계정 정보는 어떤 schema에도 포함하지 않음)
 * @returns {McpServer}
 */
function createServer() {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  server.registerTool('read_username', { description: '설정된 하이웍스 계정(username)을 확인합니다.', inputSchema: {} },
    safeTool(async () => ({ username: getCredentials().username })));
  server.registerTool('search_email', {
    description: '하이웍스 이메일을 검색합니다. (최신순)',
    inputSchema: { query: z.string().optional(), limit: z.number().optional() },
  }, safeTool(async ({ limit = DEFAULT_SEARCH_LIMIT }) => ({ emails: await fetchLatestEmails(limit) }), { emails: [] }));
  server.registerTool('read_email', { description: '하이웍스 이메일을 읽어옵니다.', inputSchema: { messageId: z.string() } },
    safeTool(async ({ messageId }) => ({ email: await findEmail(messageId) })));
  server.registerTool('save_attachment', {
    description: '하이웍스 메일의 첨부파일을 로컬 폴더(기본: downloads/hiworks)에 저장합니다. filename 생략 시 전체 저장.',
    inputSchema: { messageId: z.string(), filename: z.string().optional() },
  }, safeTool(async ({ messageId, filename }) => ({ saved: await saveAttachments(messageId, filename) })));
  server.registerTool('send_email', { description: '하이웍스 이메일을 전송합니다.', inputSchema: sendEmailSchema },
    safeTool(async (mail) => ({ messageId: await sendEmail(mail) })));
  return server;
}

/**
 * 서버를 stdio로 기동한다.
 */
async function main() {
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT', () => process.exit(0));
  await createServer().connect(new StdioServerTransport());
  log('Hiworks Mail MCP Server running on stdio');
}

main().catch((error) => {
  log('Fatal error in main():', error);
  process.exit(1);
});
