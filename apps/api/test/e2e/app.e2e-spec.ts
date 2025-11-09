import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { ValidationPipe } from '../../src/common/pipes/validation.pipe';
import { UserRole, OrderStatus } from '@prisma/client';

describe('Pocho API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  const cleanDatabase = async () => {
    await prisma.$transaction([
      prisma.notification.deleteMany(),
      prisma.orderEvent.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.order.deleteMany(),
      prisma.offer.deleteMany(),
      prisma.mealRequest.deleteMany(),
      prisma.menuItem.deleteMany(),
      prisma.menu.deleteMany(),
      prisma.vendor.deleteMany(),
      prisma.address.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  };

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('supports a meal request negotiation to order flow', async () => {
    const server = app.getHttpServer();

    const customerRegistration = await request(server)
      .post('/v1/auth/register')
      .send({
        phone: '+2348000000010',
        email: 'customer@example.com',
        password: 'StrongPass!1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        role: UserRole.CUSTOMER,
      })
      .expect(201);

    const customerToken = customerRegistration.body.tokens.accessToken;

    const customerLogin = await request(server)
      .post('/v1/auth/login')
      .send({ phone: '+2348000000010', password: 'StrongPass!1' })
      .expect(201);

    const customerLoginToken = customerLogin.body.tokens.accessToken;
    expect(customerLogin.body.user.phone).toBe('+2348000000010');

    const vendorRegistration = await request(server)
      .post('/v1/auth/register')
      .send({
        phone: '+2348000000020',
        email: 'vendor@example.com',
        password: 'StrongPass!2',
        firstName: 'Kunle',
        lastName: 'Cook',
        role: UserRole.VENDOR,
      })
      .expect(201);

    const vendorToken = vendorRegistration.body.tokens.accessToken;

    const meResponse = await request(server)
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${customerLoginToken}`)
      .expect(200);

    expect(meResponse.body.role).toBe(UserRole.CUSTOMER);

    const vendorProfile = await request(server)
      .post('/v1/vendors')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ displayName: 'Kunle Foods', kmServiceArea: 5 })
      .expect(201);

    expect(vendorProfile.body.displayName).toBe('Kunle Foods');

    const menuResponse = await request(server)
      .post('/v1/menus')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ title: 'Lunch Specials' })
      .expect(201);

    const menuId = menuResponse.body.id;
    expect(menuResponse.body.title).toBe('Lunch Specials');
    expect(menuId).toBeDefined();

    await request(server)
      .post(`/v1/menus/${menuId}/items`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        name: 'Jollof Rice',
        description: 'Smoky and spicy',
        priceKobo: 60000,
        prepMinutes: 25,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Jollof Rice');
      });

    const mealRequestResponse = await request(server)
      .post('/v1/meal-requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        category: 'Lunch',
        budgetMinKobo: 50000,
        budgetMaxKobo: 70000,
        desiredAt: new Date().toISOString(),
        deliveryLat: 6.5244,
        deliveryLng: 3.3792,
        addressLine: '42 Marina Street',
        notes: 'No peanuts',
      })
      .expect(201);

    const mealRequestId = mealRequestResponse.body.id;
    expect(mealRequestResponse.body.category).toBe('Lunch');

    const offerResponse = await request(server)
      .post('/v1/offers')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        mealRequestId,
        priceKobo: 55000,
        details: 'Jollof rice with chicken',
        prepMinutes: 30,
      })
      .expect(201);

    const offerId = offerResponse.body.id;
    expect(offerResponse.body.vendor.displayName).toBe('Kunle Foods');

    const acceptedOffer = await request(server)
      .post(`/v1/offers/${offerId}/accept`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(acceptedOffer.body.status).toBe('ACCEPTED');
    expect(acceptedOffer.body.vendor.displayName).toBe('Kunle Foods');

    const orderResponse = await request(server)
      .post('/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        offerId,
        amountKobo: 55000,
        deliveryLat: 6.5244,
        deliveryLng: 3.3792,
        etaMinutes: 45,
      })
      .expect(201);

    const orderId = orderResponse.body.id;
    expect(orderResponse.body.status).toBe(OrderStatus.CONFIRMED);
    expect(orderResponse.body.offerId).toBe(offerId);

    const statusUpdate = await request(server)
      .post(`/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: OrderStatus.PREPARING })
      .expect(200);

    expect(statusUpdate.body.status).toBe(OrderStatus.PREPARING);

    const events = await request(server)
      .get(`/v1/order-events/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(events.body.length).toBeGreaterThanOrEqual(2);
    expect(events.body.map((event) => event.type)).toContain(OrderStatus.PREPARING);

    const paymentInit = await request(server)
      .post('/v1/payments/init')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId })
      .expect(201);

    expect(paymentInit.body.reference).toBeDefined();
    expect(paymentInit.body.provider).toBe('PAYSTACK');
    expect(paymentInit.body.checkoutUrl).toContain('payments.pocho.local');
    expect(paymentInit.body.amountKobo).toBe(55000);

    const searchResponse = await request(server).get('/v1/search').query({ q: 'Jollof' }).expect(200);
    expect(searchResponse.body.menuItems.length).toBeGreaterThanOrEqual(1);
    expect(searchResponse.body.vendors.length).toBeGreaterThanOrEqual(1);
    expect(searchResponse.body.menuItems[0].name).toContain('Jollof');
  });
});
