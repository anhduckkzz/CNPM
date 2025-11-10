import http from 'k6/http';
import { check, sleep } from 'k6';
// k6 run --out cloud stress_test.js
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // warm-up: 0 → 50 users
    { duration: '1m',  target: 100 },  // tăng tải
    { duration: '2m',  target: 100 },  // giữ tải cao
    { duration: '1m',  target: 0 },    // cooldown
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],     // Tỉ lệ lỗi < 5%
    http_req_duration: ['p(95)<2000'],  // 95% request < 2s
  },
  cloud: {
    projectID: 5557483,
    name: 'CNPM Backend Stress Test (Ramp-up)',
  },
};

// Base URL thật trên Render
const BASE_URL = 'https://cnpm-rdtl.onrender.com';
const roles = ['student', 'tutor', 'staff'];

export default function () {
  // 1️⃣ Health check
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, { 'health: 200 OK': (r) => r.status === 200 });

  // 2️⃣ Login API — cần tài khoản thật
  const loginPayload = JSON.stringify({
    email: 'student@hcmut.edu.vn',
    password: '12345678',
  });
  const headers = { 'Content-Type': 'application/json' };

  const resLogin = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
  check(resLogin, { 'login: 200 OK': (r) => r.status === 200 });

  // 3️⃣ Lấy token nếu có (backend trả access_token)
  let token = null;
  try {
    token = JSON.parse(resLogin.body)?.access_token;
  } catch (_) {
    token = null;
  }

  // 4️⃣ Gọi API bundle có token (nếu có)
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const role = roles[Math.floor(Math.random() * roles.length)];
  const resBundle = http.get(`${BASE_URL}/api/portal/${role}/bundle`, { headers: authHeaders });
  check(resBundle, { [`bundle ${role}: 200 OK`]: (r) => r.status === 200 });

  sleep(1); // nghỉ 1s giữa các lượt
}
