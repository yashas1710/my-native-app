import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../src/config/firebase.js';
import planRoutes from '../src/routes/plans.js';
import PlanRepository from '../src/repositories/PlanRepository.js';
import { haversineDistanceKm } from '../src/utils/distance.js';

assert.equal(haversineDistanceKm(0, 0, 0, 0), 0);
assert.ok(Math.abs(haversineDistanceKm(0, 0, 0, 1) - 111.1949) < 0.001);
assert.ok(Number.isFinite(haversineDistanceKm(0, 0, 0, 180)));
assert.deepEqual(await PlanRepository.findNearby(null, 0, 5), { plans: [], reason: 'USER_LOCATION_MISSING' });
console.log('PASS haversine and explicit missing-location reason');

const app = express();
app.use(express.json());
app.use('/plans', planRoutes);
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const userRef = db.collection('users').doc();
const accommodationId = `nearby-check-${userRef.id}`.toLowerCase();
const fixtures = [];
const headers = { Authorization: `Bearer ${jwt.sign({ id: userRef.id }, process.env.JWT_SECRET || 'dev-secret')}` };
async function feed(query = '') {
  const response = await fetch(`${base}/plans${query}`, { headers });
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  return body;
}
async function fixture(longitude, days, accommodation = accommodationId) {
  const ref = db.collection('plans').doc();
  fixtures.push(ref);
  await ref.set({ title: 'Nearby verification fixture', location: 'Test point', latitude: 0, longitude, startDate: new Date(Date.now() + days * 86400000), accommodationId: accommodation, createdBy: userRef.id });
  return ref.id;
}
try {
  await userRef.set({ name: 'Nearby verification', email: 'nearby-check@example.invalid', accommodationId, latitude: 0, longitude: -140 });
  // Near plan is later and in another accommodation; far plan starts sooner.
  const nearId = await fixture(-139.98, 3, `${accommodationId}-other`);
  const farId = await fixture(-139.9, 1);
  const pastId = await fixture(-140, -1);
  const noCoordinatesId = await fixture(null, 1);
  let result = await feed('?radiusKm=5');
  assert.equal(result.locationFallback, false);
  assert.equal(result.page, 1);
  assert.equal(result.plans.find(plan => plan.id === nearId)?.distanceKm, 2.2);
  assert.ok(!result.plans.some(plan => [farId, pastId, noCoordinatesId].includes(plan.id)));
  console.log('PASS radius=5: near plan at 2.2 km returned across accommodations; far/past/unlocated excluded');
  result = await feed('?radiusKm=20');
  assert.ok(result.plans.findIndex(plan => plan.id === nearId) < result.plans.findIndex(plan => plan.id === farId));
  assert.equal(result.plans.find(plan => plan.id === farId)?.distanceKm, 11.1);
  console.log('PASS nearest-first order overrides start-date order');
  assert.ok(!(await feed('?radiusKm=0')).plans.some(plan => plan.id === nearId));
  assert.ok((await feed('?radiusKm=100')).plans.some(plan => plan.id === farId));
  assert.ok(!(await feed('?radiusKm=invalid')).plans.some(plan => plan.id === farId));
  assert.ok(!(await feed()).plans.some(plan => plan.id === farId));
  console.log('PASS radius clamping and default 10 km');
  await userRef.update({ latitude: null, longitude: null });
  result = await feed('?radiusKm=5');
  assert.equal(result.locationFallback, true);
  assert.ok(result.plans.some(plan => plan.id === farId));
  assert.ok(result.plans.some(plan => plan.id === noCoordinatesId));
  assert.ok(!result.plans.some(plan => [nearId, pastId].includes(plan.id)));
  console.log('PASS missing location: flagged accommodation fallback');
} finally {
  for (const ref of fixtures) await ref.delete();
  await userRef.delete();
  await new Promise(resolve => server.close(resolve));
  await db.terminate();
  console.log('Verification fixtures cleaned up');
}
