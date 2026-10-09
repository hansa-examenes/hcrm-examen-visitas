import { ServiceUnavailableException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

// Ejemplo de prueba unitaria: la conexión a Mongo se reemplaza por un mock.
describe('HealthController', () => {
  const ping = jest.fn();
  const connection = { db: { admin: () => ({ ping }) } };
  let controller: HealthController;

  beforeEach(async () => {
    ping.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: getConnectionToken(), useValue: connection }],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('responde ok cuando Mongo responde', async () => {
    ping.mockResolvedValue({ ok: 1 });
    await expect(controller.check()).resolves.toEqual({ status: 'ok', db: 'up' });
  });

  it('responde 503 cuando Mongo no responde', async () => {
    ping.mockRejectedValue(new Error('timeout'));
    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
