import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { APP_PIPE } from '@nestjs/core';

export const createTestingModule = async (providers: any[]) => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: APP_PIPE,
        useValue: new ValidationPipe({
          exceptionFactory: (errors) => {
            const errorMessages = errors.map(
              error => `${error.property} has wrong value ${error.value}, ${Object.values(error.constraints).join(', ')}`
            );
            return new BadRequestException(errorMessages);
          },
        }),
      },
    ],
  }).compile();

  return module;
};