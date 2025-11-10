import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,                  // 10 user ảo
  duration: '30s',          // test trong 30 giây
  cloud: {
    projectID: 5557483,     // ID project Grafana Cloud của bạn
    name: 'CNPM Backend Load Test'
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],       // <5% lỗi
    http_req_duration: ['p(95)<1500'],    // 95% request < 1.5s
  },
};

// ✅ base URL thật
const BASE_URL = 'https://cnpm-rdtl.onrender.com';
const roles = ['student', 'tutor', 'staff'];

export default function () {
  // 1️⃣ Health check
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'health: 200 OK': (r) => r.status === 200,
  });

  // 2️⃣ Login API (đúng schema)
  const loginPayload = JSON.stringify({
    email: 'student@hcmut.edu.vn',
    password: '12345678'
  });
  const headers = { 'Content-Type': 'application/json' };

  const resLogin = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
  check(resLogin, {
    'login: 200 OK': (r) => r.status === 200,
  });

  // 3️⃣ Fetch portal bundle
  const role = roles[Math.floor(Math.random() * roles.length)];
  const resBundle = http.get(`${BASE_URL}/api/portal/${role}/bundle`);
  check(resBundle, {
    [`bundle ${role}: 200 OK`]: (r) => r.status === 200,
  });

  sleep(1);
}
