#!/usr/bin/env node
/**
 * 하이웍스 메일 MCP 서버 (로컬 수정본)
 *
 * 원본: hiworks-mail-mcp@1.0.12 (MIT, Beyless AI)
 * 변경점:
 * - username/password를 도구 입력 schema에서 제거 → 서버 내부에서 환경변수로만 읽음
 *   (원본은 환경변수 값을 zod default로 넣어 schema에 평문 비밀번호가 노출됨)
 * - read_username 응답에서 password 제거
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import Pop3Command from 'node-pop3';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';

const SERVER_NAME = 'hiworks-mail-mcp';
const SERVER_VERSION = '1.0.12-local.1';

const POP3_CONFIG = { host: 'pop3s.hiworks.com', port: 995, tls: true };
const SMTP_CONFIG = { host: 'smtps.hiworks.com', port: 465, secure: true };
const POP3_TIMEOUT_MS = 60_000;

const DEFAULT_SEARCH_LIMIT = 100;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const NO_SUBJECT = '(제목 없음)';

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
 * Date를 KST 기준 ISO 문자열로 변환한다. (원본 동작 유지)
 * @param {Date | undefined} date 변환할 날짜
 * @returns {string}
 */
function formatDate(date) {
  const base = date ?? new Date();
  return new Date(base.getTime() + KST_OFFSET_MS).toISOString();
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
 * messageId(또는 메시지 번호)로 메일 본문을 찾는다.
 * @param {string} messageId Message-ID 또는 POP3 메시지 번호
 */
async function findEmail(messageId) {
  const client = createPop3Client();
  const [totalMessages] = await client.STAT();
  let email;
  for (let i = Number(totalMessages); i >= 1 && !email; i--) {
    try {
      const parsed = await simpleParser(await client.RETR(i));
      if (parsed.messageId === messageId || String(i) === messageId) {
        email = { ...toEmailSummary(parsed, i), content: parsed.text || '', html: parsed.html || undefined };
      }
    } catch (err) {
      log(`Error processing email ${i}:`, err);
    }
  }
  await client.QUIT();
  return email;
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
