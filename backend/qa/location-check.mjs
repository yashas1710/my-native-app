import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { db, admin } from '../src/config/firebase.js';
import meRoutes from '../src/routes/me.js';
import planRoutes from '../src/routes/plans.js';
import { updateLocationSchema, validateInput } from '../src/validators/authValidator.js';
import { createPlanSchema } from '../src/validators/planValidator.js';

const coordinates = { latitude: 12.9716, longitude: 77.5946 };
assert.equal(validateInput(updateLocationSchema, { latitude: 91 }).success, false);
assert.equal(validateInput(updateLocationSchema, { longitude: -181 }).success, false);
assert.equal(validateInput(updateLocationSchema, { latitude: '12' }).success, false);
assert.equal(updateLocationSchema.safeParse({}).success, true);
const payload = { title: 'Location verification', location: 'Test location', description: '', startDate: new Date(Date.now() + 86400000).toISOString(), endDate: null, maxSpots: null };
assert.equal(createPlanSchema.safeParse({ ...payload, latitude: -91 }).success, false);
assert.equal(createPlanSchema.safeParse({ ...payload, longitude: 181 }).success, false);
console.log('PASS coordinate validation');

const app = express();
app.use(express.json());
app.use('/me', meRoutes);
app.use('/plans', planRoutes);
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const userRef = db.collection('users').doc();
const planIds = [];
let createdUser = false;
const accommodationId = `location-check-${userRef.id}`;
const token = jwt.sign({ id: userRef.id }, process.env.JWT_SECRET || 'dev-secret');
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
try {
  assert.equal((await fetch(`${base}/me/location`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(coordinates) })).status, 401);
  await userRef.set({ name: 'Location verification fixture', email: 'location-check@example.invalid', accommodationId });
  createdUser = true;
  const response = await fetch(`${base}/me/location`, { method: 'PUT', headers, body: JSON.stringify(coordinates) });
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  const user = (await userRef.get()).data();
  assert.equal(user.latitude, coordinates.latitude);
  assert.equal(user.longitude, coordinates.longitude);
  assert.ok(user.locationUpdatedAt instanceof admin.firestore.Timestamp);
  assert.equal(user.accommodationId, accommodationId);
  assert.equal(body.user.locationUpdatedAt, user.locationUpdatedAt.toDate().toISOString());
  console.log('PASS PUT /me/location: Firestore coordinates, server timestamp, accommodation preserved');
  assert.equal((await fetch(`${base}/me/location`, { method: 'PUT', headers, body: JSON.stringify({ latitude: 91 }) })).status, 400);
  for (const withCoordinates of [true, false]) {
    const result = await fetch(`${base}/plans`, { method: 'POST', headers, body: JSON.stringify({ ...payload, ...(withCoordinates ? coordinates : {}) }) });
    const data = await result.json();
    assert.equal(result.status, 201, JSON.stringify(data));
    planIds.push(data.plan.id);
    const plan = (await db.collection('plans').doc(data.plan.id).get()).data();
    assert.equal(plan.latitude, withCoordinates ? coordinates.latitude : null);
    assert.equal(plan.longitude, withCoordinates ? coordinates.longitude : null);
    assert.equal(plan.accommodationId, accommodationId);
    console.log(`PASS POST /plans: Firestore ${withCoordinates ? 'coordinates persisted' : 'null defaults'}, accommodation preserved`);
  }
} finally {
  for (const id of planIds) await db.collection('plans').doc(id).delete();
  if (createdUser) await userRef.delete();
  await new Promise(resolve => server.close(resolve));
  await db.terminate();
  console.log('Verification fixtures cleaned up');
}
